// jwt.constants.ts
import { ConfigService } from '@nestjs/config';

export const jwtConstants = (configService: ConfigService) => ({
  secret: configService.get<string>('JWT'),
});
