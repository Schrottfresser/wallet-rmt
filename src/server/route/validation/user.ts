import z from 'zod';

export const webAuthnOptionsSchema = z.object({
    body: z.object({
        username: z.string(),
    }),
});

export const webAuthnVerifySchema = z.object({
    body: z.object({
        username: z.string(),
        attestationResponse: z.any(),
    }),
});
