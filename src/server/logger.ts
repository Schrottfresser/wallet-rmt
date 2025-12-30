import winston from 'winston';
import env from './env.js';

const { combine, timestamp, printf, colorize, json, errors } = winston.format;

const levelMap: Record<string, string> = {
    debug: 'D',
    info: 'I',
    warn: 'W',
    error: 'E',
};

const humanFormat = printf(({ level, message, timestamp, stack }) => {
    const shortLevel = levelMap[level];
    return `${shortLevel} ${timestamp}: ${stack || message}`;
});

const logger = winston.createLogger({
    level: env.isProd ? 'info' : 'debug',
    format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true })),
    transports: [
        new winston.transports.Console({
            format: combine(humanFormat, colorize({ all: true })),
        }),
        new winston.transports.File({
            dirname: env.logDir,
            filename: 'app.log',
            format: humanFormat,
        }),
        new winston.transports.File({
            dirname: env.logDir,
            filename: 'app.json.log',
            format: json(),
        }),
    ],
});

export default logger;
