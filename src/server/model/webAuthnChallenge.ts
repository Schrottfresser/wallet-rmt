import mongoose from 'mongoose';

interface IWebAuthnChallenge {
    username: string;
    challenge: string;
}

const webAuthnChallengeSchema = new mongoose.Schema<IWebAuthnChallenge>({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    challenge: {
        type: String,
        required: true,
    },
});

const WebAuthnChallenge = mongoose.model('WebAuthnChallenge', webAuthnChallengeSchema);
export type WebAuthnChallengeDoc = InstanceType<typeof WebAuthnChallenge>;

export default WebAuthnChallenge;
