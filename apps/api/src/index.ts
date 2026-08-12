import Fastify from "fastify";
import type { FastifyError } from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import { authPlugin } from "@ledgerline/authentication";
import { groupsPlugin } from "@ledgerline/groups";
import { logger, statusCodeForError } from "@ledgerline/shared";
import { env } from "./config/env.js";

const app = Fastify({ logger: true });

app.addHook("onRoute", (routeOptions) => {
  if (routeOptions.method === "HEAD") {
    return;
  }
  logger.info("API", "REST Route", { method: routeOptions.method, path: routeOptions.path });
});

app.setErrorHandler((err: FastifyError, request, reply) => {
  const statusCode = statusCodeForError(err);
  if (statusCode >= 500) {
    request.log.error(err);
    return reply.code(statusCode).send({ error: "Internal Server Error" });
  }
  return reply.code(statusCode).send({ error: err.message });
});

app.get("/health", async () => ({ status: "ok" }));

await app.register(cors, { origin: env.corsOrigin, credentials: true });
await app.register(cookie);
await app.register(authPlugin, { jwtSecret: env.jwtSecret, jwtExpiresIn: env.jwtExpiresIn });
await app.register(groupsPlugin);

app.listen({ port: env.port, host: "0.0.0.0" }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
