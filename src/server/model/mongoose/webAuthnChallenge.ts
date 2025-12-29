import mongoose from 'mongoose';

export type WebAuthnChallengePurpose = 'auth-existing' | 'auth-new' | 'registration';

export interface IWebAuthnChallenge {
    username: string;
    challenge: string;
    purpose: WebAuthnChallengePurpose;
    expiresAt: Date;
}

export const webAuthnChallengeSchema = new mongoose.Schema<IWebAuthnChallenge>({
    username: {
        type: String,
        required: true,
    },
    challenge: {
        type: String,
        required: true,
    },
    purpose: {
        type: String,
        enum: ['auth-existing', 'auth-new', 'registration'],
        required: true,
    },
    expiresAt: {
        type: Date,
        default: Date.now,
        expires: '2m',
    },
});

const WebAuthnChallenge = mongoose.model('WebAuthnChallenge', webAuthnChallengeSchema);
export type WebAuthnChallengeDoc = InstanceType<typeof WebAuthnChallenge>;

export default WebAuthnChallenge;
