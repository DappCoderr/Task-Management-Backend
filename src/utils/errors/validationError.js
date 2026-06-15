import { StatusCodes } from "http-status-codes";

class ValidationError extends Error {
  constructor(errorDetails, message) {
    super(message);
    this.name = "ValidationError";

    const explanation = [];

    const errorObj = errorDetails.error || errorDetails.fields || errorDetails;

    Object.keys(errorObj).forEach((key) => {
      explanation.push(errorObj[key]);
    });

    this.explanation = explanation;
    this.statusCode = StatusCodes.BAD_REQUEST;
  }
}

export default ValidationError;
