import LoginModal from '@client/components/LoginModal.js';
import RegistrationModal from '@client/components/RegistrationModal.js';
import useSession from '@client/hooks/useSession.js';
import useSettings from '@client/hooks/useSettings.js';
import { Button } from '@headlessui/react';
import { LockClosedIcon, PlusCircleIcon, PlusIcon, UserCircleIcon, WalletIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';

function Header() {
    const session = useSession();
    const settings = useSettings();
    const navigate = useNavigate();

    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);

    if (session.isLoading || session.error || !session.data) {
        return;
    }

    const onLoginButtonClick = async () => {
        if (session.data?.isLoggedIn) {
            navigate('/user');
        } else {
            setIsLoginModalOpen(true);
        }
    };

    const commonButtonClassName = 'flex items-center gap-1 cursor-pointer hover:bg-gray-300 pl-1 pr-2 h-10';
    const additionalButtonClassName =
        session.data.isLoggedIn || settings.data?.enableRegistration
            ? 'border-y-2 border-l-2 rounded-l-4xl'
            : 'border-2 rounded-4xl';
    const loginButtonClassName = [commonButtonClassName, additionalButtonClassName].join(' ');

    return (
        <>
            <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
            <RegistrationModal isOpen={isRegistrationModalOpen} onClose={() => setIsRegistrationModalOpen(false)} />

            <header className="flex items-center p-3 h-[var(--header-height)] border-b-2">
                <Link to="/" className="flex items-center gap-4">
                    <WalletIcon className="size-10 shrink-0" />
                    <h1 className="text-2xl">Wallet RMT</h1>
                </Link>
                <div className="flex items-center ml-auto">
                    <Button onClick={() => onLoginButtonClick()} className={loginButtonClassName}>
                        <UserCircleIcon className="size-8" />
                        {session.data.isLoggedIn ? session.data.user?.username : 'Login'}
                    </Button>
                    {session.data.isLoggedIn && (
                        <Button
                            onClick={() => session.logout()}
                            className="flex items-center gap-1 cursor-pointer hover:bg-gray-300 px-2 h-10 border-2 rounded-r-4xl"
                        >
                            <LockClosedIcon className="size-6" />
                            Logout
                        </Button>
                    )}
                    {!session.data.isLoggedIn && settings.data?.enableRegistration && (
                        <Button
                            onClick={() => setIsRegistrationModalOpen(true)}
                            className="flex items-center gap-1 cursor-pointer hover:bg-gray-300 pl-2 pr-1 h-10 border-2 rounded-r-4xl"
                        >
                            Register
                            <PlusCircleIcon className="size-8" />
                        </Button>
                    )}
                </div>
            </header>
        </>
    );
}

export default Header;
