// ApiResponse is a utility class that represents a standardized API response structure. It contains properties for the HTTP status code, response data, a message, and a success flag indicating whether the request was successful (status code < 400). The constructor initializes these properties based on the provided parameters.

export class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}
