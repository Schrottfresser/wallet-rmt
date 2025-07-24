import walletsRouter from "@server/api/wallets.js";
import { Router } from "express";

const router = Router();

router.use("/wallets", walletsRouter);

export default router;
