import mongoose from 'mongoose';
import { IWebAuthnCredential, webAuthnCredentialSchema } from './webAuthnCredential.js';
import { IEncryptedBuffer, encryptedBufferSchema } from './encryptedBuffer.js';

export interface IUser {
    username: string;
    passkeys: IWebAuthnCredential[];
    wrappedMasterKeys: Map<string, IEncryptedBuffer>;
    prfSalt?: Buffer<ArrayBuffer>;
}

export const userSchema = new mongoose.Schema<IUser>({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    passkeys: [webAuthnCredentialSchema],
    wrappedMasterKeys: {
        type: Map,
        of: encryptedBufferSchema,
        default: {},
    },
    prfSalt: Buffer,
});

const User = mongoose.model('User', userSchema);
export type UserDoc = InstanceType<typeof User>;

export default User;
