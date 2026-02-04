import { Router } from 'express';
import walletRouter from '@server/route/wallet.js';
import transactionRouter from '@server/route/transaction.js';
import userRouter from '@server/route/user.js';
import settingsRouter from '@server/route/settings.js';

const router = Router();

router.use('/wallet', walletRouter);
router.use('/transaction', transactionRouter);
router.use('/user', userRouter);
router.use('/settings', settingsRouter);

export default router;
