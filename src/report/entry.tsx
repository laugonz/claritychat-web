import { createRoot } from "react-dom/client";
import ReportPage from "../pages/ReportPage";

const root = document.getElementById("report-root");
if (root) { root.innerHTML = ""; createRoot(root).render(<ReportPage />); }
