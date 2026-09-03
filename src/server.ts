import { Hono } from "hono";
import { secureHeaders } from "hono/secure-headers";
import { logger } from "hono/logger";
import { every } from "hono/combine";
import mainFactory from "#main";

export default {
  fetch: (req: Request) => {
    const app = new Hono();
    app.use("*", every(secureHeaders(), logger()));

    app.get("/hello-world", async (c) => {
      const main = await mainFactory();
      const output = main._hello_world();

      return c.json({ output });
    });

    return app.fetch(req);
  },
};
