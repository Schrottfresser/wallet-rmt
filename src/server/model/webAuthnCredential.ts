import { Uint8Array_ } from '@simplewebauthn/server';
import mongoose from 'mongoose';

export interface IWebAuthnCredential {
    id: string;
    publicKey: Uint8Array_;
    counter: number;
}

export const webAuthnCredentialSchema = new mongoose.Schema<IWebAuthnCredential>({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    publicKey: {
        type: Buffer,
        required: true,
    },
    counter: {
        type: Number,
        required: true,
    },
});

const WebAuthnCredential = mongoose.model('WebAuthnCredential', webAuthnCredentialSchema);
export type WebAuthnCredentialDoc = InstanceType<typeof WebAuthnCredential>;

export default WebAuthnCredential;
