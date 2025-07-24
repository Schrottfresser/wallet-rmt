import fs from "fs/promises";
import express, { NextFunction, Request, Response } from "express";
import { createServer as createViteServer, ViteDevServer } from "vite";
import compression from "compression";
import sirv from "sirv";
import api from "@server/api/index.js";
import { createServer } from "http";
import mongoose from "mongoose";

const isProd = process.env.NODE_ENV === "production";

const serverIp = process.env.SERVER_IP || "0.0.0.0";
const serverPort = Number(process.env.SERVER_PORT) || 8080;
const serverBase = process.env.SERVER_BASE || "";

const dbIp = process.env.DB_IP || "127.0.0.1";
const dbPort = process.env.DB_PORT || "27017";
const dbName = process.env.DB_NAME || "wallet-rmt";

const app = express();
const server = createServer(app);

app.use(express.json());

let vite: ViteDevServer;
if (isProd) {
    app.use(compression());
    app.use(serverBase, sirv("dist/client", { extensions: [] }));
} else {
    vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "custom",
        base: serverBase,
    });

    app.use(vite.middlewares);
}

app.use("/api", api);

app.use("*all", async (req, res, next) => {
    try {
        const url = req.originalUrl.replace(serverBase, "");
        let template: string;

        let render: (url: string) => { head?: string; html: string };
        if (isProd) {
            template = await fs.readFile("dist/client/index.html", "utf-8");

            // @ts-expect-error vite server entry import
            const entryServer = await import("../../dist/ssr/entry-server.js");
            render = entryServer.render;
        } else {
            template = await fs.readFile("./index.html", "utf-8");
            template = await vite.transformIndexHtml(url, template);
            render = (await vite.ssrLoadModule("@client/entry-server")).render;
        }

        const rendered = render(url);

        const html = template
            .replace("<!--app-head-->", rendered.head ?? "")
            .replace("<!--app-html-->", rendered.html ?? "");

        res.status(200).set({ "Content-Type": "text/html" }).send(html);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
        vite?.ssrFixStacktrace(e);
        console.log(e.stack);
        next(e);
    }
});

if (isProd) {
    app.use(
        (
            err: { status: number; message: string; errors: string[] },
            _req: Request,
            res: Response,
            // We must provide a next function for the function signature here even though its not used
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            _next: NextFunction
        ) => {
            res.status(err.status || 500).json({
                message: err.message,
            });
        }
    );
} else {
    app.use(
        (
            err: { status: number; message: string; errors: string[] },
            _req: Request,
            res: Response,
            // We must provide a next function for the function signature here even though its not used
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            _next: NextFunction
        ) => {
            res.status(err.status || 500).json({
                message: err.message,
                errors: err.errors,
            });
        }
    );
}

await mongoose.connect(`mongodb://${dbIp}:${dbPort}/${dbName}`);

server.listen(serverPort, serverIp, () => {
    console.log(
        `App is listening on http://${serverIp}:${serverPort}${serverBase}`
    );
});
