/**
 * Custom API Error class that properly extracts messages from API error responses
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly statusText: string;
  public readonly errorData: Record<string, unknown> | null;

  constructor(
    status: number,
    statusText: string,
    message: string,
    errorData: Record<string, unknown> | null = null
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.errorData = errorData;
  }
}

/**
 * Parses an error response body and extracts a user-friendly message.
 * Handles various API error formats:
 * - { message: "..." }
 * - { error: "..." }
 * - { error: { message: "..." } }
 * - { errors: [...] }
 * - Plain text responses
 */
export function parseErrorResponse(
  status: number,
  statusText: string,
  body: string
): ApiError {
  // Default message based on HTTP status
  const defaultMessages: Record<number, string> = {
    400: 'Invalid request',
    401: 'Authentication required',
    403: 'Access denied',
    404: 'Resource not found',
    409: 'Conflict with existing resource',
    422: 'Validation error',
    429: 'Too many requests. Please try again later',
    500: 'Server error. Please try again later',
    502: 'Service temporarily unavailable',
    503: 'Service temporarily unavailable',
    504: 'Request timed out',
  };

  let message = defaultMessages[status] || `Request failed (${status})`;
  let errorData: Record<string, unknown> | null = null;

  // Try to parse as JSON
  if (body) {
    try {
      const parsed = JSON.parse(body) as Record<string, unknown>;
      errorData = parsed;

      // Extract message from various common formats
      if (typeof parsed.message === 'string') {
        message = parsed.message;
      } else if (typeof parsed.error === 'string') {
        message = parsed.error;
      } else if (typeof parsed.error === 'object' && parsed.error !== null) {
        const errorObj = parsed.error as Record<string, unknown>;
        if (typeof errorObj.message === 'string') {
          message = errorObj.message;
        }
      } else if (Array.isArray(parsed.errors) && parsed.errors.length > 0) {
        // Handle validation error arrays
        const firstError = parsed.errors[0];
        if (typeof firstError === 'string') {
          message = firstError;
        } else if (typeof firstError === 'object' && firstError !== null) {
          const errorObj = firstError as Record<string, unknown>;
          if (typeof errorObj.message === 'string') {
            message = errorObj.message;
          } else if (typeof errorObj.msg === 'string') {
            message = errorObj.msg;
          }
        }
      } else if (typeof parsed.detail === 'string') {
        // Some APIs use "detail" instead of "message"
        message = parsed.detail;
      }
    } catch {
      // Not JSON, use the body as-is if it's a reasonable length
      if (body.length < 200) {
        message = body;
      }
    }
  }

  return new ApiError(status, statusText, message, errorData);
}

/**
 * Extracts a user-friendly error message from any error type.
 * Use this in catch blocks to display errors to users.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    // Check if it's a fetch error or network error
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return 'Network error. Please check your connection';
    }

    // Check if the message looks like JSON (common mistake)
    if (error.message.startsWith('{') || error.message.startsWith('[')) {
      try {
        const parsed = JSON.parse(error.message);
        if (typeof parsed.message === 'string') {
          return parsed.message;
        }
        if (typeof parsed.error === 'string') {
          return parsed.error;
        }
      } catch {
        // Not valid JSON, return as-is
      }
    }

    return error.message;
  }

  return 'An unexpected error occurred';
}