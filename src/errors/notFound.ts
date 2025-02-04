import { HttpException, HttpStatus } from "@nestjs/common";

export class NotFoundError {
  constructor(message: string) {
    throw new HttpException(message, HttpStatus.NOT_FOUND);
  }
}