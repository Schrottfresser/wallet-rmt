import { PropsWithChildren } from 'react';

function WalletWrapper({ children }: PropsWithChildren) {
    return <div className="absolute h-[calc(100%-var(--header-height))] w-full flex">{children}</div>;
}

export default WalletWrapper;
