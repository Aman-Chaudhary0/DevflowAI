// asyncHandler is a higher-order function that wraps an asynchronous request handler function. It takes a request handler as an argument and returns a new function that handles the request, response, and next middleware. If the request handler returns a promise that rejects, the error is caught and passed to the next middleware for error handling.
export const asyncHandler = (requestHandler) => (req, res, next) => {
  Promise.resolve(requestHandler(req, res, next)).catch(next);
};
