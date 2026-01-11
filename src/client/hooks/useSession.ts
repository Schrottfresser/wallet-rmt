import { SessionResponse } from '@server/model/response/user.js';
import useFetch from './useFetch.js';
import useWebAuthn from './useWebAuthn.js';

function useSession() {
    const { register: webAuthnRegister, login: webAuthnLogin, addPasskey: webAuthnAddPasskey } = useWebAuthn();
    const session = useFetch<SessionResponse>('/api/user');

    const register = async (username: string) => {
        const response = await webAuthnRegister(username);

        session.refetch();
        return response;
    };

    const login = async (username: string) => {
        const response = await webAuthnLogin(username);

        session.refetch();
        return response;
    };

    const addPasskey = async () => {
        const username = session.data?.user?.username;
        if (!username) return;

        const response = await webAuthnAddPasskey(username);

        session.refetch();
        return response;
    };

    const logout = async () => {
        const username = session.data?.user?.username;
        if (!username) return;

        await fetch('/api/user/logout');

        session.refetch();
    };

    return { session, register, login, addPasskey, logout };
}

export default useSession;
