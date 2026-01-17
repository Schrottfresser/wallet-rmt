import { SessionResponse } from '@server/model/response/user.js';
import useApi from './useApi.js';
import useWebAuthn from './useWebAuthn.js';

function useSession() {
    const { register: webAuthnRegister, login: webAuthnLogin, addPasskey: webAuthnAddPasskey } = useWebAuthn();
    const { data, error, isLoading, mutate } = useApi<SessionResponse>('/api/user');

    const register = async (username: string) => {
        const response = await webAuthnRegister(username);

        return response;
    };

    const login = async (username: string) => {
        const response = await webAuthnLogin(username);

        mutate(response.session);
        return response;
    };

    const addPasskey = async () => {
        const username = data?.user?.username;
        if (!username) return;

        const response = await webAuthnAddPasskey(username);

        mutate(response.session);
        return response;
    };

    const logout = async () => {
        const username = data?.user?.username;
        if (!username) return;

        await fetch('/api/user/logout');

        mutate({ isLoggedIn: false });
    };

    return { data, error, isLoading, register, login, addPasskey, logout };
}

export default useSession;
