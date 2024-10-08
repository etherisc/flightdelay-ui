import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

function formatDate(unixDate: number) {
    // 17 July 2024
    return dayjs.unix(unixDate).format("DD MMM YYYY");
}

export { 
    dayjs as dayjs, 
    formatDate
};
