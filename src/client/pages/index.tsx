import useSession from '@client/hooks/useSession.js';
import Header from '@client/components/Header.js';
import WalletList from '@client/components/WalletList.js';
import { useState } from 'react';
import WalletCreateModal from '@client/components/WalletCreateModal.js';
import Button from '@client/components/base/Button.js';
import { PlusIcon } from '@heroicons/react/24/solid';

function index() {
    const { data: session, error, isLoading } = useSession();

    const [walletCreateModalOpen, setWalletCreateModalOpen] = useState<boolean>();

    if (isLoading || error || !session) {
        return;
    }

    return (
        <>
            <Header />
            {session.isLoggedIn && session.user && (
                <>
                    <Button
                        style="solid"
                        text="Create wallet"
                        icon={PlusIcon}
                        onClick={() => setWalletCreateModalOpen(true)}
                        className="mx-auto mt-5"
                    />
                    <WalletCreateModal
                        isOpen={walletCreateModalOpen}
                        onClose={() => setWalletCreateModalOpen(false)}
                        username={session.user?.username}
                    />
                    <WalletList />
                </>
            )}
        </>
    );
}

export default index;
