export class GeneralResponseDto<T> {
  statusCode: number;
  message: string;
  data: T;
}
