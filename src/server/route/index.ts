import remoteRouter from "@server/route/remote.js";
import walletRouter from "@server/route/wallet.js";
import transactionRouter from "@server/route/transaction.js";
import { Router } from "express";

const router = Router();

router.use("/remote", remoteRouter);
router.use("/wallet", walletRouter);
router.use("/transaction", transactionRouter);

export default router;
