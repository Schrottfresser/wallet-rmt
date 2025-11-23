import SessionPayload from '@server/model/sessionPayload.ts';
import WalletAuthPayload from '@server/model/walletAuthPayload.ts';
import 'express';

declare global {
    namespace Express {
        interface Request {
            walletAuth?: WalletAuthPayload;
        }
    }
}
