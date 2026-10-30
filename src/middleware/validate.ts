import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";


export default class ValidateMiddleware {

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
