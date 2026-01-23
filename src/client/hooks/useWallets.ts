import { parseJSON } from '@client/helpers/json.js';
import useApi from '@client/hooks/useApi.js';
import useWebAuthn from '@client/hooks/useWebAuthn.js';
import { WalletDoc, WalletType } from '@server/model/mongoose/wallet.js';
import { ObjectId } from '@server/route/validation/index.js';

function useWallets() {
    const { data, error, isLoading, mutate } = useApi<WalletDoc[]>('/api/wallet');
    const { authenticate } = useWebAuthn();

    const create = async (name: string, type: WalletType, username: string) => {
        const attestationResponse = await authenticate(username);

        const response = await fetch('/api/wallet', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                type,
                attestationResponse,
            }),
        });
        const responseText = await response.text();
        const responseJSON: WalletDoc[] = parseJSON(responseText);

        mutate(responseJSON, { revalidate: false });
    };

    const open = async (walletId: ObjectId, password?: string) => {
        const response = await fetch(`/api/wallet/${walletId}/open`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                password,
            }),
        });
        const responseText = await response.text();
        const responseJSON: WalletDoc[] = parseJSON(responseText);

        mutate(responseJSON, { revalidate: false });
    };

    const close = async (walletId: ObjectId) => {
        const response = await fetch(`/api/wallet/${walletId}/close`);
        const responseText = await response.text();
        const responseJSON: WalletDoc[] = parseJSON(responseText);

        mutate(responseJSON, { revalidate: false });
    };

    const refresh = async (walletId: ObjectId) => {
        const response = await fetch(`/api/wallet/${walletId}`);
        const responseText = await response.text();
        const responseJSON: WalletDoc[] = parseJSON(responseText);

        mutate(responseJSON, { revalidate: false });
    };

    return { data, error, isLoading, create, open, close, refresh };
}

export default useWallets;
