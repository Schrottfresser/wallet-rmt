import { Disclosure, DisclosureButton, DisclosurePanel, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import GetTransferResult from '@server/model/currency/getTransferResult.js';
import { WalletType } from '@server/model/mongoose/wallet.js';
import { currencyProperties } from '@server/util/currency.js';

interface WalletTransactionsListItemProps {
    walletType: WalletType;
    transfer: GetTransferResult;
    index: number;
}

function WalletTransactionsListItem({ walletType, transfer, index }: WalletTransactionsListItemProps) {
    const absoluteTransferAmount = transfer.amount < 0n ? -transfer.amount : transfer.amount;
    const formattedTransferAmount = currencyProperties[walletType].format(absoluteTransferAmount);
    const transferDirection = transfer.amount < 0 ? 'Sent' : 'Received';

    const addressType = transfer.amount < 0 ? 'To:' : 'From:';

    const absoluteTransferFee = transfer.fee ? (transfer.fee < 0n ? -transfer.fee : transfer.fee) : 0n;
    const formattedTransferFee = currencyProperties[walletType].format(absoluteTransferFee);

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
                                <span>
                                    {formattedTransferAmount} {transferDirection}
                                </span>
                                <span className="grow text-right font-bold">{addressType}</span>
                                <span>{transfer.address}</span>

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
                                <DisclosurePanel className="p-3 grid gap-y-2 grid-cols-8">
                                    <span className="font-bold">Fee: </span>
                                    <span className="col-span-7">{formattedTransferFee}</span>
                                    <span className="font-bold">Confirmations: </span>
                                    <span className="col-span-7">{transfer.confirmations}</span>
                                    <span className="font-bold">Transaction ID: </span>
                                    <span className="col-span-7">{transfer.transactionId}</span>
                                    <span className="font-bold">Blockheight: </span>
                                    <span className="col-span-7">{transfer.blockHeight}</span>
                                </DisclosurePanel>
                            </Transition>
                        </>
                    );
                }}
            </Disclosure>
        </li>
    );
}

export default WalletTransactionsListItem;
