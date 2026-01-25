import fetcher from '@client/util/fetcher.js';
import useWebAuthn from '@client/hooks/useWebAuthn.js';
import TransferPriority from '@server/model/currency/transferPriority.js';
import { ObjectId } from '@server/route/validation/index.js';

function useTransactions() {
    const { authenticate } = useWebAuthn();

    const transfer = async (
        username: string,
        walletId: ObjectId,
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

    return { transfer };
}

export default useTransactions;
