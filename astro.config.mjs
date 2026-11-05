import { defineConfig, envField } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://hb.seria.moe",
  env: {
    schema: {
      SERIA_API_KEY: envField.string({ context: "server", access: "secret" }),
    },
  },
  image: {
    // Discord avatars from seria-api, downloaded and optimized at build time.
    domains: ["cdn.discordapp.com"],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
