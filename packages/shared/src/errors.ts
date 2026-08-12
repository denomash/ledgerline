export class BaseError extends Error {
  public readonly source: string;
  public readonly statusCode: number;
  public readonly properties?: Record<string, unknown>;
  public readonly cause?: unknown;

  constructor(
    source: string,
    message: string,
    statusCode: number,
    properties?: Record<string, unknown>,
    cause?: unknown,
  ) {
    super(message);
    this.name = new.target.name;
    this.source = source;
    this.statusCode = statusCode;
    this.properties = properties;
    this.cause = cause;
  }
}

export class ValidationError extends BaseError {
  constructor(source: string, message: string, properties?: Record<string, unknown>, cause?: unknown) {
    super(source, message, 400, properties, cause);
  }
}

export class UnauthorizedError extends BaseError {
  constructor(source: string, message: string, properties?: Record<string, unknown>, cause?: unknown) {
    super(source, message, 401, properties, cause);
  }
}

export class ForbiddenError extends BaseError {
  constructor(source: string, message: string, properties?: Record<string, unknown>, cause?: unknown) {
    super(source, message, 403, properties, cause);
  }
}

export class NotFoundError extends BaseError {
  constructor(source: string, message: string, properties?: Record<string, unknown>, cause?: unknown) {
    super(source, message, 404, properties, cause);
  }
}

export class ConflictError extends BaseError {
  constructor(source: string, message: string, properties?: Record<string, unknown>, cause?: unknown) {
    super(source, message, 409, properties, cause);
  }
}

export function statusCodeForError(err: unknown): number {
  return typeof (err as { statusCode?: unknown })?.statusCode === "number"
    ? (err as { statusCode: number }).statusCode
    : 500;
}
