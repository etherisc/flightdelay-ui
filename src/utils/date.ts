import dayjs from "dayjs";

export function formatDate(unixDate: number) {
    // 17 July 2024
    return dayjs.unix(unixDate).format("DD MMM YYYY");
}