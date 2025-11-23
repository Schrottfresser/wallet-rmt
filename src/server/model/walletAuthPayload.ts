import { JWTPayload } from 'jose';

interface WalletAuthPayload extends JWTPayload {
    passwords: {
        [walletId: string]: string;
    };
}

export default WalletAuthPayload;
