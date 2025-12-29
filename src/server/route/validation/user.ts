import z from 'zod';

export const registerOptionsSchema = z.object({
    body: z.object({
        username: z.string(),
    }),
});

export const registerSchema = z.object({
    body: z.object({
        username: z.string(),
        attestationResponse: z.any(),
    }),
});

export const loginOptionsSchema = z.object({
    body: z.object({
        username: z.string(),
        newCredentialId: z.string().optional(),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        username: z.string(),
        attestationResponse: z.any(),
    }),
});

export const addPassphraseSchema = z.object({
    body: z.object({
        attestationResponse: z.any(),
        newAttestationResponse: z.any(),
    }),
});
