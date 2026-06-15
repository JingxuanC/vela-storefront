import {
  initializeFaro,
  getWebInstrumentations,
} from "@grafana/faro-web-sdk";

let faroInitialized = false;

export function initFaro() {
  if (faroInitialized) return;
  if (typeof window === "undefined") return;

  try {
    initializeFaro({
      url: `https://grafana.velagrow.com/collect`,
      app: {
        name: "vela-spa",
        version: "1.0.0",
        environment: "production",
      },
      instrumentations: [
        ...getWebInstrumentations({
          captureConsole: true,
        }),
      ],
    });

    faroInitialized = true;
  } catch (e) {
    // fail silently — don't break the app
  }
}
