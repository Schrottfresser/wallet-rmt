import fetcher from '@client/util/fetcher.js';
import useApi from '@client/hooks/useApi.js';
import useWebAuthn from '@client/hooks/useWebAuthn.js';
import { WalletDoc, WalletType } from '@server/model/mongoose/wallet.js';
import { ObjectId } from '@server/route/validation/index.js';

function useWallets() {
    const { data, error, isLoading, mutate } = useApi<WalletDoc[]>('/api/wallet');
    const { authenticate } = useWebAuthn();

    const create = async (name: string, type: WalletType, username: string) => {
        const attestationResponse = await authenticate(username);

        const response = await fetcher<WalletDoc[]>('/api/wallet', 'POST', {
            name,
            type,
            attestationResponse,
        });

        mutate(response, { revalidate: false });
    };

    const open = async (walletId: ObjectId, password?: string) => {
        const response = await fetcher<WalletDoc[]>(`/api/wallet/${walletId}/open`, 'POST', {
            password,
        });

        mutate(response, { revalidate: false });
    };

    const close = async (walletId: ObjectId) => {
        const response = await fetcher<WalletDoc[]>(`/api/wallet/${walletId}/close`);

        mutate(response, { revalidate: false });
    };

    const refresh = async (walletId: ObjectId) => {
        const response = await fetcher<WalletDoc[]>(`/api/wallet/${walletId}`);

        mutate(response, { revalidate: false });
    };

    return { data, error, isLoading, create, open, close, refresh };
}

export default useWallets;
