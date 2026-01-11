import { SessionResponse } from '@server/model/response/user.js';
import useFetch from './useFetch.js';
import useWebAuthn from './useWebAuthn.js';

function useSession() {
    const { register: webAuthnRegister, login: webAuthnLogin, addPasskey: webAuthnAddPasskey } = useWebAuthn();
    const session = useFetch<SessionResponse>('/api/user');

    const register = (username: string) => {
        const response = webAuthnRegister(username);

        session.refetch();
        return response;
    };

    const login = (username: string) => {
        const response = webAuthnLogin(username);

        session.refetch();
        return response;
    };

    const addPasskey = (username: string) => {
        const response = webAuthnAddPasskey(username);

        session.refetch();
        return response;
    };

    return { session, register, login, addPasskey };
}

export default useSession;
