import Button from '@client/components/base/Button.js';
import WalletAddressListItem from '@client/components/wallet/receive/WalletAddressListItem.js';
import { PlusIcon } from '@heroicons/react/24/solid';
import { WalletDoc } from '@server/model/mongoose/wallet.js';

interface WalletAddressListProps {
    wallet: WalletDoc;
    addAddress: () => void;
}

function WalletAddressList({ wallet, addAddress }: WalletAddressListProps) {
    return (
        <>
            <h2 className="text-2xl font-bold">Wallet addresses</h2>
            <ul>
                {wallet.addresses.map((walletAddress, index) => (
                    <WalletAddressListItem
                        key={index}
                        index={index}
                        walletAddress={walletAddress}
                        walletType={wallet.type}
                    />
                ))}
            </ul>

            <Button
                style="solid"
                text="Add address"
                icon={PlusIcon}
                onClick={() => addAddress()}
                className="text-lg mt-8 ml-auto"
            />
        </>
    );
}

export default WalletAddressList;
