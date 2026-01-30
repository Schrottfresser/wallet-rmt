import WalletTransactionsListItem from '@client/components/wallet/transactons/WalletTransactionsListItem.js';
import GetTransferResult from '@server/model/currency/getTransferResult.js';
import { WalletType } from '@server/model/mongoose/wallet.js';

interface WalletTransactionsListProps {
    walletType: WalletType;
    transfers: GetTransferResult[];
}

function WalletTransactionsList({ walletType, transfers }: WalletTransactionsListProps) {
    return (
        <ul>
            {transfers.map((transfer, index) => (
                <WalletTransactionsListItem key={index} walletType={walletType} transfer={transfer} index={index} />
            ))}
        </ul>
    );
}

export default WalletTransactionsList;
