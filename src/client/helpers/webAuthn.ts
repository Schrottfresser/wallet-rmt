import { PublicKeyCredentialRequestOptionsJSON, startAuthentication } from '@simplewebauthn/browser';
import { isoBase64URL } from '@simplewebauthn/server/helpers';
import { PRFExtensionResults } from '@server/model/webAuthn.js';

export async function startAuthenticationWithPRF(optionsJSON: PublicKeyCredentialRequestOptionsJSON) {
    const attestationResponseWebauthn = await startAuthentication({ optionsJSON });

    const prfExtensionResults = attestationResponseWebauthn.clientExtensionResults as PRFExtensionResults;
    const prf = prfExtensionResults.prf?.results?.first;

    const prfString = prf ? isoBase64URL.fromBuffer(prf) : undefined;
    const attestationResponse = {
        ...attestationResponseWebauthn,
        clientExtensionResults: {
            prf: {
                results: {
                    first: prfString,
                },
            },
        },
    };

    return attestationResponse;
}
