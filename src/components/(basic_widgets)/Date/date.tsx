import dayjs from "dayjs";

export default function Date({ timestamp }: { timestamp: number }) {
    const formatted = dayjs.unix(timestamp).format('DD MMM YYYY');
    return <>{formatted}</>;
}