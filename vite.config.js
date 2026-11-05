import { defineConfig } from "vite";

export default defineConfig({
  preview: {
    host: "0.0.0.0",
    allowedHosts: ["celest.up.railway.app"]
  }
});
