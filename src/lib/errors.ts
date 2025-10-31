// Custom error classes for better error handling

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export class ValidationError extends Error {
  constructor(message: string, public fields?: Record<string, string[]>) {
    super(message);
    this.name = "ValidationError";
  }
}

export class NetworkError extends Error {
  constructor(message = "Network request failed") {
    super(message);
    this.name = "NetworkError";
  }
}

export class UploadError extends Error {
  constructor(message: string, public fileId?: string) {
    super(message);
    this.name = "UploadError";
  }
}

// Error handler utility
export function handleError(error: unknown): {
  message: string;
  code?: string;
  fields?: Record<string, string[]>;
} {
  if (error instanceof ValidationError) {
    return {
      message: error.message,
      fields: error.fields,
    };
  }

  if (error instanceof ApiError) {
    return {
      message: error.message,
      code: error.code,
    };
  }

  if (error instanceof AuthError) {
    return {
      message: error.message,
      code: "AUTH_ERROR",
    };
  }

  if (error instanceof NetworkError) {
    return {
      message:
        "Network connection failed. Please check your internet connection.",
      code: "NETWORK_ERROR",
    };
  }

  if (error instanceof UploadError) {
    return {
      message: error.message,
      code: "UPLOAD_ERROR",
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: "An unexpected error occurred",
    code: "UNKNOWN_ERROR",
  };
}

// Get user-friendly error message
export function getErrorMessage(error: unknown): string {
  const { message } = handleError(error);
  return message;
}
