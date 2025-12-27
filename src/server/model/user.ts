import mongoose from 'mongoose';
import { IWebAuthnCredential, webAuthnCredentialSchema } from './webAuthnCredential.js';

export interface IUser {
    username: string;
    passkeys: IWebAuthnCredential[];
}

export const userSchema = new mongoose.Schema<IUser>({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    passkeys: [webAuthnCredentialSchema],
});

const User = mongoose.model('User', userSchema);
export type UserDoc = InstanceType<typeof User>;

export default User;
