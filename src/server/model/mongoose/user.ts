import mongoose from 'mongoose';

type KeySlotType = 'webauthn' | 'mnemonic';

export interface WebAuthnCredential {
    id: string;
    publicKey: Buffer;
    counter: number;
}

export interface KeySlot {
    type: KeySlotType;
    ciphertext?: Buffer;
    iv?: Buffer;
    label?: string;
    salt?: Buffer;
    data?: WebAuthnCredential;
}

export interface IUser {
    username: string;
    keySlots: Map<string, KeySlot>;
    prfSalt?: Buffer;
}

const webAuthnCredentialSchema = new mongoose.Schema<WebAuthnCredential>({
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

const keySlotSchema = new mongoose.Schema<KeySlot>({
    type: {
        type: String,
        enum: ['webauthn', 'mnemonic'],
        required: true,
    },
    ciphertext: Buffer,
    iv: Buffer,
    label: String,
    salt: Buffer,
    data: webAuthnCredentialSchema,
});

const userSchema = new mongoose.Schema<IUser>({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    keySlots: {
        type: Map,
        of: keySlotSchema,
        default: {},
    },
    prfSalt: Buffer,
});

const User = mongoose.model('User', userSchema);
export type UserDoc = InstanceType<typeof User>;

export default User;
