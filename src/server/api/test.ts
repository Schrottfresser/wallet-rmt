import { Router } from "express";

const testRouter = Router();

testRouter.get("/", (_req, res) => {
    res.status(200).send("test");
});

export default testRouter;