import { startAuthenticationWithPRF } from '@client/helpers/webAuthn.js';
import {
    PublicKeyCredentialCreationOptionsJSONWithPrf,
    PublicKeyCredentialRequestOptionsJSONWithPrf,
} from '@server/model/webAuthn.js';
import { base64URLStringToBuffer, startRegistration } from '@simplewebauthn/browser';
import { LoginResponse } from '@server/model/response/user.js';
import fetcher from '@client/helpers/fetcher.js';

function useWebAuthn() {
    const generateRegistrationOptions = async (
        username: string,
    ): Promise<PublicKeyCredentialCreationOptionsJSONWithPrf> => {
        const response = await fetcher<PublicKeyCredentialCreationOptionsJSONWithPrf>(
            '/api/user/register/options',
            'POST',
            { username },
        );

        return response;
    };

    const register = async (username: string) => {
        const registrationOptions = await generateRegistrationOptions(username);
        const attestationResponse = await startRegistration({ optionsJSON: registrationOptions });

        await fetcher('/api/user/register', 'POST', {
            username,
            attestationResponse,
        });
    };

    const generateLoginOptions = async (username: string): Promise<PublicKeyCredentialRequestOptionsJSONWithPrf> => {
        const options = await fetcher<any>('/api/user/login/options', 'POST', { username });
        options.extensions.prf.eval.first = base64URLStringToBuffer(options.extensions.prf.eval.first);

        return options;
    };

    const authenticate = async (username: string) => {
        const loginOptions = await generateLoginOptions(username);
        const attestationResponse = await startAuthenticationWithPRF(loginOptions);

        return attestationResponse;
    };

    const login = async (username: string): Promise<LoginResponse> => {
        const attestationResponse = await authenticate(username);

        const loginResponse = await fetcher<LoginResponse>('/api/user/login', 'POST', {
            username,
            attestationResponse,
        });

        return loginResponse;
    };

    const addPasskey = async (username: string): Promise<LoginResponse> => {
        const verificationLoginOptions = await generateLoginOptions(username);
        await register(username);

        const verificationAttestationResponse = await startAuthenticationWithPRF(verificationLoginOptions);
        const newAttestationResponse = await authenticate(username);

        const addPasskeyResponse = await fetcher<LoginResponse>('/api/user/passphrase', 'POST', {
            attestationResponse: verificationAttestationResponse,
            newAttestationResponse,
        });

        return addPasskeyResponse;
    };

    return { register, authenticate, login, addPasskey };
}

export default useWebAuthn;
