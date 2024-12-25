export enum HttpExceptionStatusText {
  NOT_FOUND = "NOT_FOUND",
  FORBIDEN = "FORBIDEN",
  UNAUTHORIZED = "UNAUTHORIZED",
  BAD_REQUEST = "BAD_REQUEST",
  SERVER_ERROR = "SERVER_ERROR",
}

export class HttpException extends Error {
  constructor(
    public message: string,
    public status: number,
    public statusText: string
  ) {
    super(message);
  }
}

export class NotFoundException extends HttpException {
  constructor(public message = "Not found.") {
    super(message, 404, HttpExceptionStatusText.NOT_FOUND);
  }
}

export class BadRequestException extends HttpException {
  constructor(
    public message = "Bad request.",
    public errors: Record<string, string[]>
  ) {
    super(message, 400, HttpExceptionStatusText.BAD_REQUEST);
  }
}

export class UnAuthorizedExcetion extends HttpException {
  constructor(public message: string) {
    super(message, 401, HttpExceptionStatusText.UNAUTHORIZED);
  }
}

export class ForbiddenException extends HttpException {
  constructor(public message: string) {
    super(message, 403, HttpExceptionStatusText.FORBIDEN);
  }
}

export class InternalServerErrorException extends HttpException {
  constructor(public message: string = "Internal server error.") {
    super(message, 500, HttpExceptionStatusText.SERVER_ERROR);
  }
}
