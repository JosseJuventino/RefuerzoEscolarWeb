import { ApiQuery, ApiQueryOptions, ApiResponse } from '@nestjs/swagger';
import { ApiResponseOptions } from '@nestjs/swagger';

export function SwaggerResponses(
  responses: ApiResponseOptions[],
): MethodDecorator {
  return (target, key, descriptor) => {
    responses.forEach((response) => {
      ApiResponse(response)(target, key, descriptor);
    });
  };
}

export function SwaggerQuery(querys: ApiQueryOptions[]): MethodDecorator {
  return (target, key, descriptor) => {
    querys.forEach((query) => {
      ApiQuery(query)(target, key, descriptor);
    });
  };
}
