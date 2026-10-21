import { defineConfig } from "vite";

// User site (grimjoke.github.io) -> base "/".
// Project site (grimjoke.github.io/<repo>) -> base "/<repo>/".
export default defineConfig({
  base: "/portfolio_page/",
});
