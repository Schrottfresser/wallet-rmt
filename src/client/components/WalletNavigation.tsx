import { ChevronRightIcon } from '@heroicons/react/24/solid';
import { WalletDoc } from '@server/model/mongoose/wallet.js';

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
    return (
        <ul className="mt-4">
            {walletNavigationOptions.map((navigationOption) => (
                <li key={navigationOption.subpath}>
                    <a
                        href={`/wallet/${wallet._id}/${navigationOption.subpath}`}
                        className="flex items-center justify-between p-2 border-2 rounded-md hover:bg-gray-300 mt-2"
                    >
                        <span>{navigationOption.text}</span>
                        <ChevronRightIcon className="size-7" />
                    </a>
                </li>
            ))}
        </ul>
    );
}

export default WalletNavigation;
