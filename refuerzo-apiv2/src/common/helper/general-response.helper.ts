import { HttpStatus } from '@nestjs/common';
import { GeneralResponseDto } from '../dto/general-response.dto';

export class GeneralResponseBuilder<T> {
  private response: GeneralResponseDto<T> = new GeneralResponseDto<T>();

  constructor() {
    this.response.statusCode = HttpStatus.OK; // default status
    this.response.message = '';
    this.response.data = null;
  }

  setStatusCode(statusCode: number): this {
    this.response.statusCode = statusCode;
    return this;
  }

  setMessage(message: string): this {
    this.response.message = message;
    return this;
  }

  setData(data: T): this {
    this.response.data = data;
    return this;
  }

  build(): GeneralResponseDto<T> {
    return this.response;
  }
}
