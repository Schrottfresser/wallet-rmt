import mongoose, { Types } from "mongoose";

export interface IRemote {
    url: string;
    username?: string;
    password?: string;
}

export interface IRemoteWithMeta extends IRemote {
    _id: Types.ObjectId;
    __v: number;
}

export const remoteSchema = new mongoose.Schema<IRemote>({
    url: {
        type: String,
        required: true,
    },
    password: String,
    username: String,
});

const Remote = mongoose.model("Remote", remoteSchema);

export default Remote;
