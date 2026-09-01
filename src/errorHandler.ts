import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppError } from './AppError';
import { ZodError } from 'zod';
import { promises as fs } from 'fs';
import * as path from 'path';

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

const writeErrorLog = async (message: string) => {
  try {
    const logDir = path.join(process.cwd(), "logs");
    await fs.mkdir(logDir, { recursive: true });
    const logFile = path.join(logDir, "error.log");
    const timestamp = new Date().toISOString();
    await fs.appendFile(logFile, `[${timestamp}] ${message}\n\n`);
  } catch (err) {
    console.error("Failed to write error log to file", err);
  }
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = "Internal server error";
    let errors: any = undefined;

    if (exception instanceof ZodError) {
      status = HttpStatus.BAD_REQUEST;
      message = "Validation failed";
      errors = exception.issues;
      
      console.error(
        `${colors.yellow}[ZodError] Validation failed${colors.reset}`,
      );
      writeErrorLog(
        `[ZodError] Validation failed: ${JSON.stringify(exception.issues)}`,
      );
    } else if (exception instanceof AppError) {
      status = exception.statusCode;
      message = exception.message;
      
      const prefixColor = exception.statusCode >= 500 ? colors.red : colors.yellow;
      console.error(
        `${prefixColor}[AppError]${colors.reset} ${colors.cyan}Source:${colors.reset} ${exception.source || "Unknown"} | ${colors.red}Error:${colors.reset} ${exception.originalError}`,
      );
      writeErrorLog(
        `[AppError] Source: ${exception.source || "Unknown"} | Message: ${exception.message} | Error: ${exception.originalError || exception.stack}`,
      );
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'string' ? res : (res as any).message || exception.message;
    } else if (exception instanceof Error) {
      console.error(`${colors.red}[Unhandled Error]${colors.reset} ${exception.message}`);
      writeErrorLog(`[Unhandled Error] ${exception.message}\nStack: ${exception.stack}`);
    } else {
      console.error(`${colors.red}[Unknown Error]${colors.reset}`, exception);
      writeErrorLog(`[Unknown Error] ${JSON.stringify(exception)}`);
    }

    const payload: any = {
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (errors) {
      payload.errors = errors;
    }

    response.status(status).json(payload);
  }
}
