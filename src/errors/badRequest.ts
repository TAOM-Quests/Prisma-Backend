import { HttpException, HttpStatus } from "@nestjs/common";

export class BadRequestError {
  constructor(message: string) {
    throw new HttpException(message, HttpStatus.BAD_REQUEST);
  }
}