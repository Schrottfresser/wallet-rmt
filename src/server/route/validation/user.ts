import z from 'zod';

export const webauthRegisterOptionsSchema = z.object({
    body: z.object({
        username: z.string(),
    }),
});

export const webauthRegisterVerifySchema = z.object({
    body: z.object({
        username: z.string(),
        attestationResponse: z.any(),
    }),
});
