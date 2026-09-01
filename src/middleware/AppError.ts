export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly originalError?: unknown;
  public source?: string;

  constructor(message: string, statusCode: number, isOperational = true, originalError?: unknown, source?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.originalError = originalError;
    (Error as any).captureStackTrace(this, this.constructor);
    
    if (source) {
      this.source = source;
    } else if (this.stack) {
      const stackLines = this.stack.split('\n');
      if (stackLines.length > 1) {
        const callerLine = stackLines[1].trim(); 
        
        let funcName = "";
        let filePath = "";
        
        const matchWithParen = callerLine.match(/at\s+(.*?)\s+\((.*?)\)/);
        if (matchWithParen) {
          funcName = matchWithParen[1];
          filePath = matchWithParen[2];
        } else {
          const matchFallback = callerLine.match(/at\s+(.*)/);
          filePath = matchFallback ? matchFallback[1] : callerLine;
        }

        // Extract just the file name and position for a cleaner log
        const fileParts = filePath.split(/[\\/]/);
        const fileNameWithPos = fileParts.length > 0 ? fileParts[fileParts.length - 1] : filePath;

        if (funcName) {
          this.source = `${funcName} [${fileNameWithPos}]`;
        } else {
          this.source = `[${fileNameWithPos}]`;
        }
      }
    }
  }
}
