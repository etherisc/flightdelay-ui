import { parseUnits, Signer } from "ethers";
import { ErrorDecoder } from "ethers-decode-error";
import { nanoid } from "nanoid";
import { FlightLib__factory, FlightOracle__factory, FlightProduct__factory, FlightUSD__factory } from "../../../contracts/flight";
import { IPolicyService__factory } from "../../../contracts/gif";
import { IBundleService__factory, IPoolService__factory } from "../../../contracts/gif/factories/pool";
import { AirportBlacklistedError, AirportNotWhitelistedError, TransactionFailedException } from "../../../types/errors";
import { Airport } from "../../../types/flightstats/airport";
import { ApplicationData, PermitData, PurchaseRequest } from "../../../types/purchase_request";
import { LOGGER } from "../../../utils/logger_backend";
import { PRODUCT_CONTRACT_ADDRESS } from "../_utils/api_constants";
import { checkSignerBalance, getStatisticsProviderSigner, getTxOpts } from "../_utils/chain";
import { flightstatsRatingsUrl, flightstatsScheduleUrl } from "../_utils/flightstats";
import { Rating } from "../../../types/flightstats/rating";

/**
 * purchase protection for a flight
 */
export async function POST(request: Request) {
    const jsonBody = await request.json() as PurchaseRequest;
    
    const reqId = nanoid();
    LOGGER.debug(`[${reqId} purchase protection for flight ${jsonBody.application.carrier} ${jsonBody.application.flightNumber} ${jsonBody.application.departureDate}`);

    const signer = await getStatisticsProviderSigner();
    try {
        await hasBalance(signer);

        await validateFlight(jsonBody.application);
        await validateStatistics(jsonBody.application);

        const permit = preparePermitData(jsonBody.permit);
        const applicationData = prepareApplicationData(jsonBody.application);

        const { tx } = await createPolicy(signer, permit, applicationData);
        return Response.json({
            tx
        }, { status: 202 });
    } catch (err) {
        LOGGER.error(err);
        if (err instanceof TransactionFailedException) {
            return Response.json({
                error: "TX_FAILED",
                transaction: err.transaction,
                decodedError: err.decodedError,
            }, { status: 500 });
        } else if (err instanceof AirportBlacklistedError) {
            return Response.json({
                error: "AIRPORT_BLACKLISTED",
                message: err.message,
            }, { status: 400 });
        } else if (err instanceof AirportNotWhitelistedError) {
            return Response.json({
                error: "AIRPORT_NOT_WHITELISTED",
                message: err.message,
            }, { status: 400 });
        } else {
            // @ts-expect-error balance error
            if (err.message === "BALANCE_ERROR") {
                return Response.json({
                    error: "BALANCE_ERROR"
                }, { status: 500 });
            } else {
                // @ts-expect-error unknown error
                LOGGER.error(`unexpected error: ${err.message}`);
                return Response.json({
                    error: "unexpected error occured",
                    // @ts-expect-error unknown error
                    message: err.message,
                }, { status: 500 });
            }
        }
    }
}

async function hasBalance(signer: Signer) {
    const minBalance = parseUnits(process.env.STATISTICS_PROVIDER_MIN_BALANCE! || "1", "wei");
    if (! await checkSignerBalance(signer, minBalance)) {
        throw new Error("BALANCE_ERROR");
    }
}

/**
 * Fetch flight schedule from flightstats api and compare with application data
 */
async function validateFlight(application: ApplicationData) {
    try {
        const carrier = application.carrier;
        const flightNumber = application.flightNumber;
        const departureDate = application.departureDate;
        
        const response = await fetch(flightstatsScheduleUrl(carrier, flightNumber, departureDate.substring(0, 4), departureDate.substring(4, 6), departureDate.substring(6, 8)));

        if (!response.ok) {
            throw new Error("Flight not found on flightstats api");
        }

        const flightData = await response.json();
        
        const scheduledFlights = flightData.scheduledFlights;
        if (scheduledFlights.length === 0) {
            throw new Error("Flight not found");
        }

        const appendix = flightData.appendix;
        if (appendix.length === 0) {
            throw new Error("Flight not found");
        }
        const airports = appendix.airports.map((airport: Airport) => airport.iata) as string[];
        LOGGER.debug(`airports in flightPlan: ${JSON.stringify(airports)}`);

        const airportsBlacklistRaw = process.env.NEXT_PUBLIC_AIRPORTS_BLACKLIST?.trim() ?? '';
        const airportsBlacklist = airportsBlacklistRaw !== '' ? airportsBlacklistRaw.split(',').map((airport) => airport.trim()) : [];

        if (airportsBlacklist.some((airport) => airports.includes(airport))) {
            throw new AirportBlacklistedError(JSON.stringify(airports));
        }

        LOGGER.debug('airports not blacklisted');

        const airportsWhitelistRaw = process.env.NEXT_PUBLIC_AIRPORTS_WHITELIST?.trim() ?? '';
        const airportsWhitelist = airportsWhitelistRaw !== '' ? airportsWhitelistRaw.split(',').map((airport) => airport.trim()) : [];

        if (airportsWhitelist.length > 0 && !airportsWhitelist.some((airport) => airports.includes(airport))) {
            throw new AirportNotWhitelistedError(JSON.stringify(airports));
        }

        const departureAirportIataFlightStats = appendix.airports.find((airport: Airport) => airport.fs === scheduledFlights[0].departureAirportFsCode)?.iata;    
        if (departureAirportIataFlightStats !== application.departureAirport) {
            throw new Error("Departure airport invalid");
        }

        const arrivalAirportIataFlightStats = appendix.airports.find((airport: Airport) => airport.fs === scheduledFlights[0].arrivalAirportFsCode)?.iata;
        if (arrivalAirportIataFlightStats !== application.arrivalAirport) {
            throw new Error("Arrival airport invalid");
        }

        LOGGER.debug('airports whitelisted');
    } catch (err) {
        // @ts-expect-error error has field message
        LOGGER.error(err.message);
        throw new Error("Flight not found");
    }
}

/**
 * Fetch flight statistics from flightstats api and compare with application statistics
 */
async function validateStatistics(application: ApplicationData) {
    const carrier = application.carrier;
    const flightNumber = application.flightNumber;
    
    const fsResponse = await fetch(flightstatsRatingsUrl(carrier, flightNumber));

    if (!fsResponse.ok) {
        throw new Error("Flight not found on flightstats api");
    }

    const fsData = await fsResponse.json();

    if (fsData.ratings === undefined || fsData.ratings.length === 0) {
        throw new Error("Flight ratings not found");
    }

    const rating = fsData.ratings[0] as Rating;

    const stats = [rating.observations, rating.late15, rating.late30, rating.late45, rating.cancelled, rating.diverted];

    // compare stats vs application statistics
    if (stats.length !== application.statistics.length) {
        throw new Error("Statistics length mismatch");
    }

    LOGGER.debug(`stats: ${JSON.stringify(stats)}, application statistics: ${JSON.stringify(application.statistics)}`);
    if (!stats.every((value, index) => value === application.statistics[index])) {
        throw new Error("Statistics mismatch");
    }
}

function preparePermitData(permit: PermitData) {
    LOGGER.debug(`preparePermitData`);
    return {
        owner: permit.owner,
        spender: permit.spender,
        value: permit.value,
        deadline: permit.deadline,
        v: permit.v,
        r: permit.r,
        s: permit.s,
    }
}

function prepareApplicationData(application: ApplicationData) {
    const flightDataString = `${application.carrier} ${application.flightNumber} ${application.departureAirport} ${application.arrivalAirport} ${application.departureDate}`;
    LOGGER.debug(`prepareApplicationData flightData: ${flightDataString}, departureTimeLocal:${application.departureTimeLocal}, arrivalTimeLocal:${application.arrivalTimeLocal}`);

    return {
        flightData: flightDataString,
        departureTime: application.departureTime,
        departureTimeLocal: application.departureTimeLocal,
        arrivalTime: application.arrivalTime,
        arrivalTimeLocal: application.arrivalTimeLocal,
        premiumAmount: application.premiumAmount,
        statistics: application.statistics,
        v: application.v,
        r: application.r,
        s: application.s,
    }
}


async function createPolicy(
    signer: Signer,
    permit: { owner: string; spender: string; value: bigint; deadline: number; v: number; r: string; s: string; }, 
    applicationData: { flightData: string; departureTime: number; departureTimeLocal: string, arrivalTime: number; arrivalTimeLocal: string, premiumAmount: bigint; statistics: number[]; v: number; r: string; s: string; 
}): Promise<{ tx: string }> {
    LOGGER.debug(`createPolicy for ${applicationData.flightData}`);
    LOGGER.debug(`permit: ${JSON.stringify(permit)}`);
    LOGGER.debug(`applicationData: ${JSON.stringify(applicationData)}`);
    const productAddress = PRODUCT_CONTRACT_ADDRESS;

    const flightProduct = FlightProduct__factory.connect(productAddress, signer);
    LOGGER.debug(`=> createPolicyWithPermit`);

    try {
        const txResp = await flightProduct.createPolicyWithPermit(permit, applicationData, getTxOpts());
        LOGGER.debug(`waiting for tx: ${txResp.hash}`);
        return { tx: txResp.hash };
    } catch (err) {
        const errorDecoder = ErrorDecoder.create([
            FlightProduct__factory.createInterface(), 
            FlightUSD__factory.createInterface(),
            FlightOracle__factory.createInterface(),
            IPolicyService__factory.createInterface(),
            IPoolService__factory.createInterface(),
            IBundleService__factory.createInterface(),
            FlightLib__factory.createInterface(),
        ]);
        const decodedError = await errorDecoder.decode(err);
        LOGGER.error(`Decoded error reason: ${decodedError.reason}`);
        LOGGER.error(`Decoded error args: ${decodedError.args}`);
        throw new TransactionFailedException(null, decodedError);
    }
}

