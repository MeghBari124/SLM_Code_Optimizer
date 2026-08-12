/**
 * Base application error class
 */
export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly statusCode: number = 500,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error (400)
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('VALIDATION_ERROR', message, 400, details);
    this.name = 'ValidationError';
  }
}

/**
 * Not found error (404)
 */
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super('NOT_FOUND', `${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Unauthorized error (401)
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super('UNAUTHORIZED', message, 401);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Payment required error (402)
 */
export class PaymentRequiredError extends AppError {
  constructor(message = 'Payment required', details?: Record<string, unknown>) {
    super('PAYMENT_REQUIRED', message, 402, details);
    this.name = 'PaymentRequiredError';
  }
}

/**
 * Analysis error (500)
 */
export class AnalysisError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('ANALYSIS_ERROR', message, 500, details);
    this.name = 'AnalysisError';
  }
}

/**
 * Security error (403)
 */
export class SecurityError extends AppError {
  constructor(message: string) {
    super('SECURITY_ERROR', message, 403);
    this.name = 'SecurityError';
  }
}
