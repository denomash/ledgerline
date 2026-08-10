import Fastify from "fastify";
import cookie from "@fastify/cookie";
import { authPlugin } from "@ledgerline/authentication";
import { logger } from "@ledgerline/shared";
import { env } from "./config/env.js";

const app = Fastify({ logger: true });

app.addHook("onRoute", (routeOptions) => {
  if (routeOptions.method === "HEAD") {
    return;
  }
  logger.info("API", "REST Route", { method: routeOptions.method, path: routeOptions.path });
});

app.get("/health", async () => ({ status: "ok" }));

await app.register(cookie);
await app.register(authPlugin, { jwtSecret: env.jwtSecret, jwtExpiresIn: env.jwtExpiresIn });

app.listen({ port: env.port, host: "0.0.0.0" }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
