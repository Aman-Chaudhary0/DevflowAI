// ApiError is a custom error class that extends the built-in Error class. It is used to represent API-related errors with additional properties such as statusCode, errors, and success. The constructor takes in a status code, an optional message, and an optional array of errors, and sets these properties accordingly. The stack trace is captured for debugging purposes.
export class ApiError extends Error {
  constructor(statusCode, message = "Something went wrong", errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.success = false;
    Error.captureStackTrace(this, this.constructor);
  }
}
