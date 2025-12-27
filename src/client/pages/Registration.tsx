import { startAuthentication, startRegistration } from '@simplewebauthn/browser';
import { useState } from 'react';

export default function Registration() {
    const [username, setUsername] = useState('');

    async function register() {
        const optionsResponse = await fetch('/api/user/webauthn/register/options', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username }),
        });
        const optionsJSON = await optionsResponse.json();

        const attestationResponse = await startRegistration({ optionsJSON });

        const verificationResp = await fetch('/api/user/webauthn/register/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                attestationResponse,
            }),
        });
        const verificationJSON = await verificationResp.json();

        console.log(verificationJSON);
    }

    async function login() {
        const optionsResponse = await fetch('/api/user/webauthn/login/options', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username }),
        });
        const optionsJSON = await optionsResponse.json();

        const attestationResponse = await startAuthentication({ optionsJSON });

        const verificationResp = await fetch('/api/user/webauthn/login/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                attestationResponse,
            }),
        });
        const verificationJSON = await verificationResp.json();

        console.log(verificationJSON);
    }

    return (
        <div className="mx-auto mt-5 flex w-min gap-2">
            <input type="text" onChange={(event) => setUsername(event.target.value)} className="border-2 p-2" />
            <button className="bg-green-700 px-5 py-2 hover:cursor-pointer" onClick={register}>
                Register
            </button>
            <button className="bg-blue-700 px-5 py-2 hover:cursor-pointer" onClick={login}>
                Login
            </button>
        </div>
    );
}
