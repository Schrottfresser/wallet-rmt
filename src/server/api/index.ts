import remotesRouter from "@server/api/remotes.js";
import walletsRouter from "@server/api/wallets.js";
import transactionsRouter from "@server/api/transactions.js";
import { Router } from "express";

const router = Router();

router.use("/remotes", remotesRouter);
router.use("/wallets", walletsRouter);
router.use("/transactions", transactionsRouter);

export default router;
