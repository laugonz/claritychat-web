import { createRoot } from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import { findRoute } from "./routes";
import "../public/style.css";

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <>
      {findRoute(window.location.pathname).element}
      <Analytics />
    </>,
  );
}
