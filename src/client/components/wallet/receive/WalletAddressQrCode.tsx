import { currencyIconMap } from '@client/util/currency.js';
import { WalletType } from '@server/model/mongoose/wallet.js';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';

interface WalletAddressQrCodeProps {
    walletType: WalletType;
    walletAddress: string;
}

function WalletAddressQrCode({ walletType, walletAddress }: WalletAddressQrCodeProps) {
    const [qrCode, setQrCode] = useState('');

    const WalletIcon = currencyIconMap[walletType];

    useEffect(() => {
        QRCode.toDataURL(`${walletType}:${walletAddress}`, {
            width: 256,
            errorCorrectionLevel: 'high',
        }).then((qrCode) => setQrCode(qrCode));
    }, []);

    return (
        <div className="relative flex justify-center">
            <img src={qrCode} alt="QR Code" className="aspect-square" />

            <div className="absolute inset-0 flex items-center justify-center">
                <WalletIcon className="size-14 bg-white rounded-xl p-1" />
            </div>
        </div>
    );
}

export default WalletAddressQrCode;
