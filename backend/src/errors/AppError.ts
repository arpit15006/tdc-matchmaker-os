/**
 * Application error carrying an HTTP status, a stable machine-readable code,
 * and an optional details payload. Thrown anywhere in the service layer and
 * translated to JSON by the central error handler.
 */
export class AppError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static badRequest(message: string, details?: unknown) {
    return new AppError(400, 'BAD_REQUEST', message, details);
  }

  static unauthorized(message = 'Authentication required') {
    return new AppError(401, 'UNAUTHORIZED', message);
  }

  static forbidden(message = 'Forbidden') {
    return new AppError(403, 'FORBIDDEN', message);
  }

  static notFound(message = 'Resource not found') {
    return new AppError(404, 'NOT_FOUND', message);
  }

  static conflict(message: string) {
    return new AppError(409, 'CONFLICT', message);
  }

  static aiUnavailable(message = 'AI service is not configured') {
    return new AppError(503, 'AI_UNAVAILABLE', message);
  }

  static upstream(message = 'Upstream service error') {
    return new AppError(502, 'UPSTREAM_ERROR', message);
  }
}
