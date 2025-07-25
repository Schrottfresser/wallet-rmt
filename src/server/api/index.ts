import remotesRouter from "@server/api/remotes.js";
import walletsRouter from "@server/api/wallets.js";
import { Router } from "express";

const router = Router();

router.use("/wallets", walletsRouter);
router.use("/remotes", remotesRouter);

export default router;
