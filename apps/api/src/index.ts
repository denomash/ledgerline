import Fastify from "fastify";
import type { FastifyError } from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import { authPlugin } from "@ledgerline/authentication";
import { groupsPlugin } from "@ledgerline/groups";
import { logger, statusCodeForError } from "@ledgerline/shared";
import { env } from "./config/env.js";

const app = Fastify({ logger: false });

app.addHook("onRoute", (routeOptions) => {
  if (routeOptions.method === "HEAD") {
    return;
  }
  logger.info("API", "REST Route", { method: routeOptions.method, path: routeOptions.path });
});

app.addHook("onResponse", async (request, reply) => {
  logger.info("API", `${request.method} ${request.url}`, {
    statusCode: reply.statusCode,
    responseTime: `${reply.elapsedTime.toFixed(1)}ms`,
  });
});

app.setErrorHandler((err: FastifyError, request, reply) => {
  const statusCode = statusCodeForError(err);
  if (statusCode >= 500) {
    logger.error("API", err.message, { method: request.method, url: request.url, stack: err.stack });
    return reply.code(statusCode).send({ error: "Internal Server Error" });
  }
  return reply.code(statusCode).send({ error: err.message });
});

app.get("/health", async () => ({ status: "ok" }));

await app.register(cors, { origin: env.corsOrigin, credentials: true });
await app.register(cookie);
await app.register(authPlugin, { jwtSecret: env.jwtSecret, jwtExpiresIn: env.jwtExpiresIn });
await app.register(groupsPlugin);

app
  .listen({ port: env.port, host: "0.0.0.0" })
  .then((address) => {
    logger.info("API", "Server listening", { address });
  })
  .catch((err) => {
    logger.error("API", "Failed to start server", { stack: (err as Error).stack });
    process.exit(1);
  });
