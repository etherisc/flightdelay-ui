import { FLIGHTSTATS_BASE_URL } from "./api_constants";

export function flightstatsScheduleUrl(
    carrier: string, flightNumber: string, year: string, month: string, day: string
): string {
    const scheduleUrl = FLIGHTSTATS_BASE_URL + '/schedules/rest/v1/json/flight';
    return `${scheduleUrl}/${encodeURIComponent(carrier)}/${encodeURIComponent(flightNumber)}` 
        + `/departing/${encodeURIComponent(year)}/${encodeURIComponent(month)}/${encodeURIComponent(day)}`
        + `?appId=${process.env.FLIGHTSTATS_APP_ID}&appKey=${process.env.FLIGHTSTATS_APP_KEY}`;
}

export function flightstatsStatusUrl(
    carrier: string, flightNumber: string, year: string, month: string, day: string
): string {
    const statusUrl = FLIGHTSTATS_BASE_URL + '/flightstatus/rest/v2/json/flight/status/';
    return `${statusUrl}/${encodeURIComponent(carrier)}/${encodeURIComponent(flightNumber)}` 
        + `/dep/${encodeURIComponent(year)}/${encodeURIComponent(month)}/${encodeURIComponent(day)}`
        + `?appId=${process.env.FLIGHTSTATS_APP_ID}&appKey=${process.env.FLIGHTSTATS_APP_KEY}`;
}

export function flightstatsAirportUrl(
    code: string
) {
    const url = FLIGHTSTATS_BASE_URL + '/airports/rest/v1/json/iata';
    return `${url}/${encodeURIComponent(code)}`
        + `?appId=${process.env.FLIGHTSTATS_APP_ID}&appKey=${process.env.FLIGHTSTATS_APP_KEY}`;
}
