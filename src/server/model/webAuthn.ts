import { PublicKeyCredentialCreationOptionsJSON, PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/server';

export interface AuthenticationExtensionsClientInputsWithPrf {
    appid?: string;
    credProps?: boolean;
    hmacCreateSecret?: boolean;
    minPinLength?: boolean;
    prf?: {
        eval?: {
            first?: string;
            second?: string;
        };
        results?: {
            first?: string;
            second?: string;
        };
        enabled?: boolean;
    };
}

export interface AuthenticationExtensionsClientInputsWithPrfBuffer
    extends Omit<AuthenticationExtensionsClientInputsWithPrf, 'prf'> {
    prf?: {
        eval?: {
            first?: Buffer<ArrayBuffer>;
            second?: Buffer<ArrayBuffer>;
        };
        results?: {
            first?: Buffer<ArrayBuffer>;
            second?: Buffer<ArrayBuffer>;
        };
        enabled?: boolean;
    };
}

export interface PublicKeyCredentialCreationOptionsJSONWithPrf extends PublicKeyCredentialCreationOptionsJSON {
    extensions: AuthenticationExtensionsClientInputsWithPrf;
}

export interface PublicKeyCredentialRequestOptionsJSONWithPrf extends PublicKeyCredentialRequestOptionsJSON {
    extensions: AuthenticationExtensionsClientInputsWithPrf;
}
