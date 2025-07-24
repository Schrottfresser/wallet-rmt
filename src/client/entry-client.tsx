import React from "react";
import { hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import Router from "@client/router.js";
import "./index.css";

const container = document.getElementById("root")!;

hydrateRoot(
    container,
    <React.StrictMode>
        <BrowserRouter>
            <Router />
        </BrowserRouter>
    </React.StrictMode>
);