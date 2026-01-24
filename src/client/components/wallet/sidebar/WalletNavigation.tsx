import { normalizePath } from '@client/util/common.js';
import { ChevronRightIcon } from '@heroicons/react/24/solid';
import { WalletDoc } from '@server/model/mongoose/wallet.js';
import { Link, useLocation } from 'react-router';

interface WalletNavigationOption {
    subpath: string;
    text: string;
}

const walletNavigationOptions: WalletNavigationOption[] = [
    {
        subpath: '',
        text: 'Overview',
    },
    {
        subpath: 'send',
        text: 'Send',
    },
    {
        subpath: 'receive',
        text: 'Receive',
    },
    {
        subpath: 'transactions',
        text: 'Transactions',
    },
    {
        subpath: 'settings',
        text: 'Settings',
    },
];

interface WalletNavigationProps {
    wallet: WalletDoc;
}

function WalletNavigation({ wallet }: Readonly<WalletNavigationProps>) {
    const { pathname } = useLocation();

    return (
        <ul className="mt-4">
            {walletNavigationOptions.map((navigationOption) => {
                const linkpath = `/wallet/${wallet._id}/${navigationOption.subpath}`;
                const isCurrentPage = normalizePath(pathname) === normalizePath(linkpath);

                const baseClasses = 'flex items-center justify-between p-2 border-2 rounded-md hover:bg-gray-300 mt-2';
                const selectedClasses = isCurrentPage
                    ? 'bg-black border-black text-white hover:bg-gray-800 hover:border-gray-800'
                    : '';
                const classes = [baseClasses, selectedClasses].join(' ');

                return (
                    <li key={navigationOption.subpath}>
                        <Link to={linkpath} className={classes}>
                            <span>{navigationOption.text}</span>
                            <ChevronRightIcon className="size-7" />
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
}

export default WalletNavigation;
