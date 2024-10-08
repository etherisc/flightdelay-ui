import winston from "winston";

const logLevel = process.env.LOG_LEVEL || 'info';
const LOGGER = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss"}),
        winston.format.json(),
    ),
    transports: [
        new winston.transports.Console({
            level: process.env.NODE_ENV !== 'production' ? 'debug' : logLevel,
        }),
    ],
});

export { LOGGER };
