import { startAuthenticationWithPRF } from '@client/helpers/webAuthn.js';
import {
    PublicKeyCredentialCreationOptionsJSONWithPrf,
    PublicKeyCredentialRequestOptionsJSONWithPrf,
} from '@server/model/webAuthn.js';
import { base64URLStringToBuffer, startRegistration } from '@simplewebauthn/browser';
import { LoginResponse } from '@server/model/response/user.js';

function useWebAuthn() {
    const generateRegistrationOptions = async (
        username: string,
    ): Promise<PublicKeyCredentialCreationOptionsJSONWithPrf> => {
        const optionsResponse = await fetch('/api/user/register/options', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username }),
        });
        const optionsJSON = await optionsResponse.json();

        return optionsJSON;
    };

    const register = async (username: string) => {
        const registrationOptions = await generateRegistrationOptions(username);
        const attestationResponse = await startRegistration({ optionsJSON: registrationOptions });

        await fetch('/api/user/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                attestationResponse,
            }),
        });
    };

    const generateLoginOptions = async (username: string): Promise<PublicKeyCredentialRequestOptionsJSONWithPrf> => {
        const optionsResponse = await fetch('/api/user/login/options', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username }),
        });
        const optionsJSON = await optionsResponse.json();
        optionsJSON.extensions.prf.eval.first = base64URLStringToBuffer(optionsJSON.extensions.prf.eval.first);

        return optionsJSON;
    };

    const authenticate = async (username: string) => {
        const loginOptions = await generateLoginOptions(username);
        const attestationResponse = await startAuthenticationWithPRF(loginOptions);

        return attestationResponse;
    };

    const login = async (username: string): Promise<LoginResponse> => {
        const attestationResponse = await authenticate(username);

        const loginResponse = await fetch('/api/user/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                attestationResponse,
            }),
        });
        const loginJSON = await loginResponse.json();

        return loginJSON;
    };

    const addPasskey = async (username: string): Promise<LoginResponse> => {
        const verificationLoginOptions = await generateLoginOptions(username);
        await register(username);

        const verificationAttestationResponse = await startAuthenticationWithPRF(verificationLoginOptions);
        const newAttestationResponse = await authenticate(username);

        const addPasskeyResponse = await fetch('/api/user/passphrase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                attestationResponse: verificationAttestationResponse,
                newAttestationResponse,
            }),
        });
        const addPasskeyJSON = await addPasskeyResponse.json();

        return addPasskeyJSON;
    };

    return { register, authenticate, login, addPasskey };
}

export default useWebAuthn;
