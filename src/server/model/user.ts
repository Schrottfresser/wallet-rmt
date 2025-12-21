import mongoose from 'mongoose';

export interface IUser {
    username: string;
    credentialId?: string;
}

export const userSchema = new mongoose.Schema<IUser>({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    credentialId: String,
});

const User = mongoose.model('User', userSchema);
export type UserDoc = InstanceType<typeof User>;

export default User;
