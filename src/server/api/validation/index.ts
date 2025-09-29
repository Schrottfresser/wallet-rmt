import BadRequestError from "@server/errors/badRequestError.js";
import { Request, Response, NextFunction, RequestHandler } from "express";
import mongoose from "mongoose";
import z from "zod";

export const createValidatedHandler = <T extends z.ZodType>(
    schema: T,
    handler: (
        data: z.infer<T>,
        req: Request,
        res: Response,
        next: NextFunction
    ) => any
): RequestHandler => {
    return (req, res, next) => {
        const parsed = schema.safeParse({
            body: req.body,
            query: req.query,
            params: req.params,
        });

        if (!parsed.success) {
            throw new BadRequestError(parsed.error.message);
        }

        return handler(parsed.data, req, res, next);
    };
};

export const objectIdSchema = z
    .string()
    .refine((val) => mongoose.Types.ObjectId.isValid(val), {
        message: "Invalid ObjectId",
    })
    .transform((val) => new mongoose.Types.ObjectId(val));

export type ObjectId = z.infer<typeof objectIdSchema>;
