import WalletAddressQrCode from '@client/components/wallet/receive/WalletAddressQrCode.js';
import { Button, Disclosure, DisclosureButton, DisclosurePanel, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { WalletType } from '@server/model/mongoose/wallet.js';

interface WalletAddressListItemProps {
    walletAddress: string;
    index: number;
    walletType: WalletType;
}

function WalletAddressListItem({ index, walletAddress, walletType }: WalletAddressListItemProps) {
    return (
        <li className="mt-4 rounded-md border-2">
            <Disclosure>
                {({ open }) => {
                    const baseButtonClasses =
                        'rounded-md p-3 flex items-center gap-3 w-full cursor-pointer hover:bg-gray-300';
                    const openButtonClasses = open ? 'border-b-2' : '';
                    const buttonClasses = [baseButtonClasses, openButtonClasses].join(' ');

                    const baseChevronIconClasses = 'ml-auto size-8 transition-transform duration-200 ease-in-out';
                    const openChevronIconClasses = open ? 'rotate-180' : 'rotate-0';
                    const chevronIconClasses = [baseChevronIconClasses, openChevronIconClasses].join(' ');

                    return (
                        <>
                            <DisclosureButton className={buttonClasses}>
                                <span className="font-bold">#{index}</span>
                                <span>{walletAddress}</span>

                                <ChevronDownIcon className={chevronIconClasses} />
                            </DisclosureButton>

                            <Transition
                                show={open}
                                enter="transition-all duration-200 ease-out"
                                enterFrom="opacity-0 max-h-0"
                                enterTo="opacity-100 max-h-[42px]"
                                leave="transition-all duration-200 ease-in"
                                leaveFrom="opacity-100 max-h-[42px]"
                                leaveTo="opacity-0 max-h-0"
                            >
                                <DisclosurePanel className="p-3 overflow-hidden">
                                    <WalletAddressQrCode walletType={walletType} walletAddress={walletAddress} />
                                </DisclosurePanel>
                            </Transition>
                        </>
                    );
                }}
            </Disclosure>
        </li>
    );
}

export default WalletAddressListItem;
