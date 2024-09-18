'use client';

import { Coder } from "abi-coder";
import { ContractTransactionResponse, Provider, Signer, ethers } from "ethers";
import { Coordinates } from '../../types/coordinates';
import { CoverageType } from "../../types/coverage_type";
import { PolicyData, PolicyState } from '../../types/policy_data';
import { stringifyBigInt } from '../../utils/bigint';
// import { COORDINATES_PRECISION, getCoordinatesFromLocation } from '../../utils/coordinates';
import { BaseError } from '../../utils/error';
import { EVENT_APPLICATION_TX_FAIL, EVENT_APPLICATION_TX_START, EVENT_APPLICATION_TX_SUCCESS, useAnalytics } from '../use_analytics';

export function useProductContract(productContractAddress: string) {
    const { trackEvent } = useAnalytics();

    async function createApplication(
        signer: Signer,
        locationId: number,
        locationCoordinates: Coordinates,
        referralCode: string,
        triggerMmi: number,
        coverageType: CoverageType,
        sumInsuredAmountInWei: bigint,
        premiumAmountInWei: bigint,
        onTransactionCreated?: (tx: ContractTransactionResponse) => Promise<void>,
    ): Promise<{ nftId: bigint }> {
        const lifetime = 365*24*3600;
        return await createApplicationTx(signer, lifetime, locationId, locationCoordinates, referralCode, triggerMmi, coverageType, sumInsuredAmountInWei, premiumAmountInWei, onTransactionCreated);
    }

    async function createApplicationTx(
        signer: Signer,
        lifetime: number,
        locationId: number,
        locationCoordinates: Coordinates,
        referralCode: string,
        triggerMmi: number,
        coverageType: CoverageType,
        sumInsuredInWei: bigint,
        premiumInWei: bigint,
        onTransactionCreated?: (tx: ContractTransactionResponse) => Promise<void>,
    ): Promise<{ nftId: bigint }> {
        // const productContract = ProductV01__factory.connect(productContractAddress, signer);
        const productContract = null;
        const type = coverageType === CoverageType.FragileShield ? 0 : 1;
        
        // round coordinates to 7 digits as exepcted by the contract
        const lat = Math.round(locationCoordinates.lat * 10 ** COORDINATES_PRECISION);
        const lng = Math.round(locationCoordinates.lng * 10 ** COORDINATES_PRECISION);
    
        console.log("encodeApplicationData", type, lat, lng, triggerMmi, sumInsuredInWei);
        const data = await productContract.encodeApplicationData(
            type,
            lat, lng,
            0, 0, // use this for user coordinates
            triggerMmi, sumInsuredInWei / BigInt(4),
            triggerMmi + 1, sumInsuredInWei / BigInt(2),
            triggerMmi + 2, sumInsuredInWei,
        );
        
        trackEvent(EVENT_APPLICATION_TX_START);
        console.log("create application", referralCode, locationId, data, lifetime, sumInsuredInWei, premiumInWei);
        const tx = await productContract.createApplication(
            referralCode,
            locationId.toString(),
            data,
            lifetime,
            sumInsuredInWei,
            premiumInWei,
        );

        if (onTransactionCreated) {
            await onTransactionCreated(tx);
        }
        
        console.log("application tx", tx)
        const receipt = await tx.wait();
        console.log("application tx mined", receipt, tx)

        if (receipt.status !== 1) {
            trackEvent(EVENT_APPLICATION_TX_FAIL);
            throw new BaseError("PROD-001:TX_FAILED", `tx failed: ${receipt.hash}`);
        }

        trackEvent(EVENT_APPLICATION_TX_SUCCESS);

        const nftId = extractNftIdFromLogs(receipt.logs);

        return {
            nftId
        }
    }

    async function getNftAddress(signer: Signer): Promise<string> {
        // const productContract = ProductV01__factory.connect(productContractAddress, signer);
        // const registryAddress =  await productContract.getRegistry();
        // const registry = IChainRegistry__factory.connect(registryAddress, signer);
        // const nftAddress = await registry.getChainNft();
        // console.log("registry", registryAddress, "nft", nftAddress);
        // return nftAddress;
        return "0x";
    }

    async function fetchPolicyData(
        nftIds: bigint[], 
        signer: Signer,
        onPolicyFetched: (policy: PolicyData) => Promise<void>,
    ): Promise<void> {
        
        await Promise.all(nftIds.map(async (nftId) => {
            // const policy = await fetchPolicy(nftId, productContract, signer.provider);
            // onPolicyFetched(policy);
        }));
    }

    async function fetchPolicy(nftId: bigint, product: any, provider: Provider): Promise<PolicyData> {
        console.log("fetching policy", nftId);
        const startedAt = new Date().getTime();
        // StateId state,
        // uint24 cityId, // DUPLICATE ERRROR CODE
        // ReferralId referralId,
        // bytes memory applicationData,
        // uint8 declineReason,
        // uint256 sumInsuredAmount,
        // uint256 premiumAmount,
        // Timestamp activatedAt, // time of underwriting
        // Timestamp expiredAt, // no new claims (activatedAt + lifetime)
        // Timestamp closedAt, // no locked capital
        // Blocknumber createdIn
        const { 
            cityId,
            state, 
            applicationData, 
            premiumAmount, 
            sumInsuredAmount, 
            createdIn,
            expiredAt } = await product.getApplication(nftId);
        const { 
            policyType, 
            cityLocation, 
            payoutScheme: { 
                low: { 
                    mmi: lowMmi, 
                    payoutAmount: lowPayoutAmount 
                }, 
                medium: { 
                    mmi: mediumMmi, 
                    payoutAmount: mediumPayoutAmount 
                }, 
                high: { 
                    mmi: highMmi, 
                    payoutAmount: highPayoutAmount 
                } 
            } 
        } = await product.decodeApplicationData(applicationData);
        const createdAt = await mapBlocknumberToTimestamp(createdIn, provider);
        console.log("fetched policy", nftId, new Date().getTime() - startedAt, "ms");
        const coordinates = await getCoordinatesFromLocation(cityLocation, product);
        const payoutScale = [
            { mmiLevel: stringifyBigInt(lowMmi), payoutAmount: stringifyBigInt(lowPayoutAmount) },
            { mmiLevel: stringifyBigInt(mediumMmi), payoutAmount: stringifyBigInt(mediumPayoutAmount) },
            { mmiLevel: stringifyBigInt(highMmi), payoutAmount: stringifyBigInt(highPayoutAmount) },
        ];
        return {
            nftId: stringifyBigInt(nftId),
            state: mapPolicyState(state),
            type: mapCoverageType(policyType),
            premium: stringifyBigInt(premiumAmount),
            sumInsured: stringifyBigInt(sumInsuredAmount),
            locationId: Number(cityId), 
            locationName: null,
            locationCoordinates: coordinates,
            claimedAmount: stringifyBigInt(BigInt(0)),
            createdAt,
            expirationAt: Number(expiredAt),
            payoutScale,
        } as PolicyData;
    }

    async function mapBlocknumberToTimestamp(blocknumber: bigint, provider: ethers.Provider): Promise<number> {
        return (await provider.getBlock(blocknumber)).timestamp;
    }

    async function getTokenHandlerAddress(signer: Signer): Promise<string> {
        // const productContract = ProductV01__factory.connect(productContractAddress, signer);
        // const tokenHandlerAddress = await productContract.getTokenHandler();
        // console.log("token handler", tokenHandlerAddress);
        // return tokenHandlerAddress;
        return "0x";
    }

    function mapPolicyState(state: bigint): PolicyState {
        switch (state) {
            case BigInt(10): return PolicyState.APPLIED;
            case BigInt(20): return PolicyState.REVOKED;
            case BigInt(30): return PolicyState.DECLINED;
            case BigInt(40): return PolicyState.UNDERWRITTEN;
            case BigInt(50): return PolicyState.CONFIRMED;
            case BigInt(60): return PolicyState.EXPECTED;
            case BigInt(100): return PolicyState.ACTIVE;
            case BigInt(110): return PolicyState.PAUSED;
            case BigInt(200): return PolicyState.CLOSED;
            case BigInt(210): return PolicyState.ARCHIVED;
            case BigInt(220): return PolicyState.PAID;
            default: throw new BaseError("PROD-040:INVALID_STATE", `invalid state ${state}`);
        }
    }

    function mapCoverageType(typeId: bigint): CoverageType {
        switch (typeId) {
            case BigInt(0): return CoverageType.FragileShield;
            case BigInt(1): return CoverageType.HomeGuard;
            default: throw new BaseError("PROD-050:INVALID_TYPE", `invalid type ${typeId}`);
        }
    }

    /* eslint-disable */
    function extractNftIdFromLogs(logs: any[]): bigint|undefined {
        // const riskpoolAbiCoder = new Coder(IProductService.abi);
        // let nftId = undefined;
    
        // logs.forEach(log => {
        //     try {
        //         const evt = riskpoolAbiCoder.decodeEvent(log.topics, log.data);
        //         console.log(evt);
        //         if (evt.name === 'LogApplicationNftCreated') {
        //             // console.log(evt);
        //             // @ts-ignore
        //             nftId = evt.values.applicationNftId;
        //         }
        //     } catch (e) {
        //         console.log(e);
        //     }
        // });

        // if (nftId === undefined) {
        //     throw new BaseError("PROD-010:NFT_NOT_FOUND");
        // }
    
        // return nftId;
        return BigInt(0);
    }
    /* eslint-enable */
    
    return {
        createApplication,
        getNftAddress,
        fetchPolicyData,
        getTokenHandlerAddress,
    } 
}
