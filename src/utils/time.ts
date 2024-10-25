import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

export function adjustToUtc(time: string, tzRegionName: string): dayjs.Dayjs {
    // convert to UTC
    dayjs.extend(utc);
    dayjs.extend(timezone);
    return dayjs.tz(time, tzRegionName).utc();
}