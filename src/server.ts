import { Hono } from "hono";
import { secureHeaders } from "hono/secure-headers";
import { logger } from "hono/logger";
import { every } from "hono/combine";
import mainFactory from "#main";
import mainWasm from "#main/main.wasm?url";

import js from "@shikijs/langs/javascript";
import nord from "@shikijs/themes/nord";
import { createHighlighter } from "shiki";

export default {
  fetch: (req: Request) => {
    const app = new Hono();
    app.use("*", every(secureHeaders(), logger()));

    app.get("/hello-world", async (c) => {
      const main = await mainFactory(mainWasm);
      const output = main._hello_world();

      return c.json({ output });
    });

    app.get("/shiki", async (c) => {
      const highlighter = await createHighlighter({
        themes: [nord],
        langs: [js],
      });

      return c.text(
        highlighter.codeToHtml("console.log('shiki');", {
          theme: "nord",
          lang: "js",
        }),
      );
    });

    return app.fetch(req);
  },
};
