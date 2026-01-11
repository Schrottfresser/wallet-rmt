import z from 'zod';

const authenticatorAttachmentSchema = z.enum(['cross-platform', 'platform']);
const authenticationExtensionsClientOutputsSchema = z.object({
    appid: z.boolean().optional(),
    credProps: z.object({ rk: z.boolean().optional() }).optional(),
    hmacCreateSecret: z.boolean().optional(),
    prf: z
        .object({
            results: z
                .object({
                    first: z.string().optional(),
                })
                .optional(),
        })
        .optional(),
});
const publicKeyCredentialTypeSchema = z.enum(['public-key']);

const registrationResponseSchema = z.object({
    id: z.string(),
    rawId: z.string(),
    response: z.object({
        clientDataJSON: z.string(),
        attestationObject: z.string(),
        authenticatorData: z.string().optional(),
        transports: z.array(z.enum(['hybrid', 'ble', 'cable', 'internal', 'nfc', 'smart-card', 'usb'])).optional(),
        publicKeyAlgorithm: z.number().optional(),
        publicKey: z.string().optional(),
    }),
    authenticatorAttachment: authenticatorAttachmentSchema.optional(),
    clientExtensionResults: authenticationExtensionsClientOutputsSchema,
    type: publicKeyCredentialTypeSchema,
});

const loginResponseSchema = z.object({
    id: z.string(),
    rawId: z.string(),
    response: z.object({
        clientDataJSON: z.string(),
        authenticatorData: z.string(),
        signature: z.string(),
        userHandle: z.string().optional(),
    }),
    authenticatorAttachment: authenticatorAttachmentSchema.optional(),
    clientExtensionResults: authenticationExtensionsClientOutputsSchema,
    type: publicKeyCredentialTypeSchema,
});

export const registerOptionsSchema = z.object({
    body: z.object({
        username: z.string(),
    }),
});

export const registerSchema = z.object({
    body: z.object({
        username: z.string(),
        attestationResponse: registrationResponseSchema,
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
        attestationResponse: loginResponseSchema,
    }),
});

export const addPassphraseSchema = z.object({
    body: z.object({
        attestationResponse: loginResponseSchema,
        newAttestationResponse: loginResponseSchema,
    }),
});
