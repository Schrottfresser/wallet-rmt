import remotesRouter from "@server/route/remotes.js";
import walletsRouter from "@server/route/wallets.js";
import transactionsRouter from "@server/route/transactions.js";
import { Router } from "express";

const router = Router();

router.use("/remotes", remotesRouter);
router.use("/wallets", walletsRouter);
router.use("/transactions", transactionsRouter);

export default router;
