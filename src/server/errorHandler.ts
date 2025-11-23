import { ErrorRequestHandler } from 'express';

export interface RequestError {
    message: string;
    status?: number;
    stack?: string;
}

export const errorHandler: ErrorRequestHandler = (err: RequestError, _req, res, _next) => {
    res.status(err.status || 500).json({
        message: err.message,
        stack: err.stack,
    });
};

export const prodErrorHandler: ErrorRequestHandler = (err: RequestError, _req, res, _next) => {
    res.status(err.status || 500).json({
        message: err.message,
    });
};
