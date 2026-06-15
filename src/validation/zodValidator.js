import { ZodError } from "zod";
import { StatusCodes } from "http-status-codes";
import { customErrorResponse } from "../utils/common/responseObject.js";

export const validate = (model) => {
  return async (req, res, next) => {
    try {
      await model.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const explanation = error.issues.map(
          (issue) => `${issue.path.join(".")} ${issue.message}`,
        );

        return res.status(StatusCodes.BAD_REQUEST).json(
          customErrorResponse({
            message: "Validation Error",
            explanation,
          }),
        );
      }

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
        customErrorResponse({
          message: error.message,
          explanation: [],
        }),
      );
    }
  };
};
