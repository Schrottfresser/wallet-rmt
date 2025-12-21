import walletRouter from '@server/route/wallet.js';
import transactionRouter from '@server/route/transaction.js';
import { Router } from 'express';
import userRouter from './user.js';

const router = Router();

router.use('/wallet', walletRouter);
router.use('/transaction', transactionRouter);
router.use('/user', userRouter);

export default router;
