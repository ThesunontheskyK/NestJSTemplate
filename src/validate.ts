import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

/**
 * Middleware for validating request data using Zod schemas.
 */
export default class ValidateMiddleware {
  /**
   * Validates the request body against the provided schema.
   * @param schema Zod schema to validate against
   */
  static validate = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        await schema.parseAsync(req.body);
        next();
      } catch (error:any) {
        console.log(error.message);

        if (error instanceof ZodError) {
          return res.status(400).json({
            message: error.issues.map((err) => `${err.code}`+` of `+`${err.path}`).join(","),
          });
        }
        next(error);
      }
    };
  };

  /**
   * Validates the request query parameters against the provided schema.
   * @param schema Zod schema to validate against
   */
  static query = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        await schema.parseAsync(req.query);
        next();
      } catch (error) {
        console.log(error);

        if (error instanceof ZodError) {
          return res.status(400).json({
            message: error.issues.map((err) => `${err.message}`).join("\n"),
          });
        }
        next(error);
      }
    };
  };

  /**
   * Validates the request URL parameters against the provided schema.
   * @param schema Zod schema to validate against
   */
  static params = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        await schema.parseAsync(req.params);
        next();
      } catch (error) {
        console.log(error);

        if (error instanceof ZodError) {
          return res.status(400).json({
            message: error.issues.map((err) => `${err.message}`).join("\n"),
          });
        }
        next(error);
      }
    };
  };
}
