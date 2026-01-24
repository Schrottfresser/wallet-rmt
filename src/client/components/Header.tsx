import LoginModal from '@client/components/LoginModal.js';
import useSession from '@client/hooks/useSession.js';
import { Button } from '@headlessui/react';
import { LockClosedIcon, UserCircleIcon, WalletIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import { useNavigate } from 'react-router';

function Header() {
    const session = useSession();
    const navigate = useNavigate();

    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

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

    const commonButtonClassName = 'flex items-center gap-1 cursor-pointer hover:bg-gray-300 px-1 pr-2 h-10 ';
    const loggedInButtonClassName = 'border-y-2 border-l-2 rounded-l-4xl';
    const loggedOutButtonClassName = 'border-2 rounded-4xl';
    const loginButtonClassName =
        commonButtonClassName + (session.data.isLoggedIn ? loggedInButtonClassName : loggedOutButtonClassName);

    return (
        <>
            <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
            <header className="flex items-center p-3 h-[var(--header-height)] border-b-2">
                <a href="/" className="flex items-center gap-4">
                    <WalletIcon className="size-10 shrink-0" />
                    <h1 className="text-2xl">Wallet RMT</h1>
                </a>
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
                </div>
            </header>
        </>
    );
}

export default Header;
