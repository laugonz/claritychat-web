import { createRoot } from "react-dom/client";
import { findRoute } from "./routes";
import "../public/style.css";

const root = document.getElementById("root");
const route = findRoute(window.location.pathname);
document.documentElement.lang = route.locale;
if (root) createRoot(root).render(route.element);
