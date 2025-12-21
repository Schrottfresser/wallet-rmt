import mongoose from 'mongoose';

interface IWebauthnChallenge {
    username: string;
    challenge: string;
}

const webauthnChallengeSchema = new mongoose.Schema<IWebauthnChallenge>({
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

const WebauthnChallenge = mongoose.model('WebauthnChallenge', webauthnChallengeSchema);
export type WebauthnChallengeDoc = InstanceType<typeof WebauthnChallenge>;

export default WebauthnChallenge;
