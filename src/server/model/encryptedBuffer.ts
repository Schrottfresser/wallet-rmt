import mongoose from 'mongoose';

export interface IEncryptedBuffer {
    ciphertext: Buffer<ArrayBuffer>;
    iv: Buffer<ArrayBuffer>;
    salt?: Buffer<ArrayBuffer>;
}

export const encryptedBufferSchema = new mongoose.Schema<IEncryptedBuffer>({
    ciphertext: {
        type: Buffer,
        required: true,
    },
    iv: {
        type: Buffer,
        required: true,
    },
    salt: Buffer,
});

const EncryptedBuffer = mongoose.model('EncryptedBuffer', encryptedBufferSchema);
export type EncryptedBufferDoc = InstanceType<typeof EncryptedBuffer>;

export default EncryptedBuffer;
