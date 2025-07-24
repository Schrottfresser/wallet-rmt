import testRouter from "@server/api/test.js";
import { Router } from "express";

const router = Router();

router.use("/test", testRouter);

export default router;
