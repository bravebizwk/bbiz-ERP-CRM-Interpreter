import React from "react";
import ReactDOM from "react-dom/client";
import { App } from '@/app/App';
import "@/styles/css/index.css";
import "@/styles/scss/main.scss";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
