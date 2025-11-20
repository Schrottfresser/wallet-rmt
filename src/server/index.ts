import fs from "fs/promises";
import express from "express";
import { createServer as createViteServer, ViteDevServer } from "vite";
import compression from "compression";
import sirv from "sirv";
import api from "@server/route/index.js";
import { createServer } from "http";
import mongoose from "mongoose";
import { errorHandler, prodErrorHandler } from "@server/errorHandler.js";
import env from "@server/env.js";

const app = express();
const server = createServer(app);

app.use(express.json());

let vite: ViteDevServer;
if (env.isProd) {
    app.use(compression());
    app.use(env.serverBase, sirv("dist/client", { extensions: [] }));
} else {
    vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "custom",
        base: env.serverBase,
    });

    app.use(vite.middlewares);
}

app.use("/api", api);

app.get("*all", async (req, res, next) => {
    try {
        const url = req.originalUrl.replace(env.serverBase, "");
        let template: string;

        let render: (url: string) => { head?: string; html: string };
        if (env.isProd) {
            template = await fs.readFile("dist/client/index.html", "utf-8");

            // @ts-expect-error vite server entry import
            const entryServer = await import("../ssr/entry-server.js");
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
    } catch (error) {
        if (error instanceof Error) {
            vite?.ssrFixStacktrace(error);
            console.log(error.stack);
            next(error);
        }
    }
});

app.use(env.isProd ? prodErrorHandler : errorHandler);

await mongoose.connect(`mongodb://${env.dbIp}:${env.dbPort}/${env.dbName}`);

server.listen(env.serverPort, env.serverIp, () => {
    console.log(
        `App is listening on http://${env.serverIp}:${env.serverPort}${env.serverBase}`
    );
});
