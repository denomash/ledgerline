import type { SignOptions } from "jsonwebtoken";

export interface JwtPayload {
  sub: string;
}

export interface JwtServiceConfig {
  secret: string;
  expiresIn: SignOptions["expiresIn"];
}

export interface JwtService {
  sign(payload: JwtPayload): string;
  verify(token: string): JwtPayload;
}
