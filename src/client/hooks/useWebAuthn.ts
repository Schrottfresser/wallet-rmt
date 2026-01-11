import { startAuthenticationWithPRF } from '@client/helpers/webAuthn.js';
import {
    base64URLStringToBuffer,
    RegistrationResponseJSON,
    AuthenticationResponseJSON,
    startRegistration,
} from '@simplewebauthn/browser';

function useWebAuthn() {
    const getRegistrationOptions = async (username: string) => {
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

    const register = async (username: string): Promise<RegistrationResponseJSON> => {
        const registrationOptions = await getRegistrationOptions(username);
        const attestationResponse = await startRegistration({ optionsJSON: registrationOptions });

        const verificationResponse = await fetch('/api/user/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                attestationResponse,
            }),
        });
        const verificationJSON = await verificationResponse.json();

        return verificationJSON;
    };

    const getLoginOptions = async (username: string) => {
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

    const login = async (username: string): Promise<AuthenticationResponseJSON> => {
        const loginOptions = await getLoginOptions(username);
        const attestationResponse = await startAuthenticationWithPRF(loginOptions);

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

    const addPasskey = async (username: string) => {
        const verificationLoginOptions = await getLoginOptions(username);
        await register(username);

        const verificationAttestationResponse = await startAuthenticationWithPRF(verificationLoginOptions);
        const newLoginOptions = await getLoginOptions(username);
        const newAttestationResponse = await startAuthenticationWithPRF(newLoginOptions);

        await fetch('/api/user/passphrase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                attestationResponse: verificationAttestationResponse,
                newAttestationResponse,
            }),
        });
    };

    return { register, login, addPasskey };
}

export default useWebAuthn;
