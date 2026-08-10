import jwt from "jsonwebtoken";
import type { JwtService, JwtServiceConfig } from "./types.js";

export type { JwtPayload, JwtService, JwtServiceConfig } from "./types.js";

export function createJwtService(config: JwtServiceConfig): JwtService {
  return {
    sign(payload) {
      return jwt.sign(payload, config.secret, { expiresIn: config.expiresIn });
    },
    verify(token) {
      return jwt.verify(token, config.secret) as ReturnType<JwtService["verify"]>;
    },
  };
}
