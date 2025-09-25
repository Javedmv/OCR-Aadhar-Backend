import { Request, Response, NextFunction } from "express";

interface AppError extends Error {
  statusCode?: number;
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const error = err as AppError;
  const status = error.statusCode && Number.isInteger(error.statusCode)
    ? error.statusCode
    : 500;
  const message = error.message || "Internal Server Error";
  res.status(status).json({ error: message });
}