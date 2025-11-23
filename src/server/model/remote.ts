import mongoose from 'mongoose';

export type RemoteType = 'bitcoin' | 'monero';

export interface IRemote {
    type: RemoteType;
    url: string;
    username?: string;
    password?: string;
}

export interface IRemoteWithMeta extends IRemote {
    _id: mongoose.Types.ObjectId;
    __v: number;
}

export const remoteSchema = new mongoose.Schema<IRemote>({
    type: {
        type: String,
        required: true,
        enum: ['bitcoin', 'monero'],
    },
    url: {
        type: String,
        required: true,
    },
    password: String,
    username: String,
});

const Remote = mongoose.model('Remote', remoteSchema);

export default Remote;
