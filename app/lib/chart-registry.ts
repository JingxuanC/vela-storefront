// ============================================================================
// Chart.js — Global Registration
// Call this once at the app entry point to avoid multiple register() calls
// across different route modules. Module-level ChartJS.register() in
// individual route files causes "Canvas is already in use" errors.
// ============================================================================
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler,
} from "chart.js";

let registered = false;

export function registerChartJS() {
  if (registered || typeof window === "undefined") return;
  registered = true;
  ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, Title, Tooltip, Legend, Filler,
  );
}
