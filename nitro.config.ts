import { defineConfig } from "nitro";

export default defineConfig({
  preset: "netlify-edge",
  serverEntry: "./src/server.ts",
  minify: false,
  wasm: {},
});
