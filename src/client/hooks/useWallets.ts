import useApi from '@client/hooks/useApi.js';
import useWebAuthn from '@client/hooks/useWebAuthn.js';
import { IWallet, WalletType } from '@server/model/mongoose/wallet.js';

function useWallets() {
    const { data, error, isLoading, mutate } = useApi<IWallet[]>('/api/wallet');
    const { authenticate } = useWebAuthn();

    const createWallet = async (name: string, type: WalletType, username: string) => {
        const attestationResponse = await authenticate(username);

        const createWalletResponse = await fetch('/api/wallet', {
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
        const createWalletJSON = await createWalletResponse.json();

        mutate(createWalletJSON);
    };

    return { data, error, isLoading, createWallet };
}

export default useWallets;
