import winston from 'winston';
import env from './env.js';

const { combine, timestamp, printf, colorize, json, errors } = winston.format;

const humanFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} ${level}: ${stack || message}`;
});

const logger = winston.createLogger({
    level: env.isProd ? 'info' : 'debug',
    format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true })),
    transports: [
        new winston.transports.Console({
            format: combine(humanFormat, colorize({ all: true })),
        }),
        new winston.transports.File({
            filename: 'app.log',
            format: humanFormat,
        }),
        new winston.transports.File({
            filename: 'app.json.log',
            format: json(),
        }),
    ],
});

export default logger;
