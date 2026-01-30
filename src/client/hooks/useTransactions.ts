import fetcher from '@client/util/fetcher.js';
import useWebAuthn from '@client/hooks/useWebAuthn.js';
import TransferPriority from '@server/model/currency/transferPriority.js';
import useApi from '@client/hooks/useApi.js';
import GetTransferResult from '@server/model/currency/getTransferResult.js';

function useTransactions(walletId: string) {
    const { data, error, isLoading, mutate } = useApi<GetTransferResult[]>(`/api/transaction?walletId=${walletId}`);
    const { authenticate } = useWebAuthn();

    const transfer = async (
        username: string,
        address: string,
        amount: bigint,
        estimateMode?: TransferPriority,
        substractFee?: boolean,
    ) => {
        const attestationResponse = await authenticate(username);

        const response = await fetcher<string>(`/api/transaction?walletId=${walletId}`, 'POST', {
            attestationResponse,
            address,
            amount,
            estimateMode,
            substractFee,
        });

        return response;
    };

    return { data, error, isLoading, transfer };
}

export default useTransactions;
