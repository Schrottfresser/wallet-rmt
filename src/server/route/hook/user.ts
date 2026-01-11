import BadRequestError from '@server/error/badRequestError.js';
import User, { UserDoc } from '@server/model/mongoose/user.js';

export async function useUser(username: string, throwOnBadRequest: true): Promise<UserDoc>;
export async function useUser(username: string, throwOnBadRequest?: false): Promise<UserDoc | null>;
export async function useUser(username: string, throwOnBadRequest?: boolean): Promise<UserDoc | null> {
    const user = await User.findOne({ username: username });
    if (!user && throwOnBadRequest) {
        throw new BadRequestError('User not found');
    }

    return user;
}
