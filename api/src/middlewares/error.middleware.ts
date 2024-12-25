import { NextFunction, Request, Response } from "express";
import {
  BadRequestException,
  HttpException,
  HttpExceptionStatusText,
} from "../errors";

export function errorMiddleware(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (error instanceof HttpException) {
    const errorData: Record<string, any> = {
      message: error.message,
      statusText: error.statusText,
    };

    if (error instanceof BadRequestException) {
      errorData["errors"] = error.errors;
    }

    res.status(error.status).json(errorData);
    return;
  }

  res.status(500).json({
    message: "Something went wrong.",
    statusText: HttpExceptionStatusText.SERVER_ERROR,
  });
}
