import React from "react";
import ReactDOMServer from "react-dom/server";
import { StaticRouter } from "react-router";
import Router from "@client/router.js";
import "./index.css";

export function render(url: string) {
    const html = ReactDOMServer.renderToString(
        <React.StrictMode>
            <StaticRouter location={url}>
                <Router />
            </StaticRouter>
        </React.StrictMode>
    );

    return { html };
}