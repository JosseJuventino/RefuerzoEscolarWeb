
import debug from "debug";
import { Request, Response, NextFunction } from "express";

const debugLog = debug("marn-api:error");

// Middleware de manejo de errores
const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  debugLog(err);
  res.status(err.status || 500).json({ message: err.message });
};

export { errorHandler };
