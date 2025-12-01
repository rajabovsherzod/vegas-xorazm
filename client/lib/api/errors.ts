export enum ErrorCode {
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
}

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly originalError?: any;

  constructor(message: string, code: string = ErrorCode.UNKNOWN_ERROR, statusCode: number = 500, originalError?: any) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Kirish huquqi yo‘q') {
    super(message, 'AUTHENTICATION_ERROR', 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Ruxsat etilmagan') {
    super(message, 'AUTHORIZATION_ERROR', 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Ma\'lumot topilmadi') {
    super(message, 'NOT_FOUND_ERROR', 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Ma\'lumotlar to\'qnashuvi (Duplicate)') {
    super(message, 'CONFLICT_ERROR', 409);
  }
}

export class ValidationError extends AppError {
  public readonly errors?: Record<string, string[]>;

  constructor(message = 'Validatsiya xatoligi', errors?: Record<string, string[]>) {
    super(message, 'VALIDATION_ERROR', 400);
    this.errors = errors;
  }
}

export class ServerError extends AppError {
  constructor(message = 'Server xatoligi') {
    super(message, 'SERVER_ERROR', 500);
  }
}