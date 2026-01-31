import Button from '@client/components/base/Button.js';
import WalletEncryptionModal from '@client/components/wallet/settings/WalletEncryptionModal.js';
import { KeyIcon } from '@heroicons/react/24/solid';
import { WalletDoc } from '@server/model/mongoose/wallet.js';
import { useState } from 'react';

interface WalletEncryptionProps {
    wallet: WalletDoc;
    walletPassword: (newPassword: string, oldPassword?: string) => Promise<void>;
}

function WalletEncryption({ wallet, walletPassword }: WalletEncryptionProps) {
    const [walletEncryptionModalOpen, setWalletEncryptionModalOpen] = useState(false);

    const walletEncryptionStatus = wallet.isLocked
        ? 'Your wallet is already encrypted'
        : 'Your wallet is currently unencrypted';
    const encryptButtonText = wallet.isLocked ? 'Change password' : 'Encrypt it now';

    return (
        <>
            <WalletEncryptionModal
                isOpen={walletEncryptionModalOpen}
                onClose={() => setWalletEncryptionModalOpen(false)}
                walletPassword={walletPassword}
                isLocked={wallet.isLocked}
            />

            <h2 className="text-2xl font-bold">Wallet Encryption</h2>
            <p className="mt-4">{walletEncryptionStatus}.</p>
            <Button
                style="solid"
                icon={KeyIcon}
                text={encryptButtonText}
                onClick={() => setWalletEncryptionModalOpen(true)}
                className="mt-4"
            />
        </>
    );
}

export default WalletEncryption;
