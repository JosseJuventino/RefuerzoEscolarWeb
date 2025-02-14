import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/common/constants/jwt.constant';
import { CommonModule } from 'src/common/common.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tokens } from './entities/token.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RolesModule } from 'src/roles/roles.module';
import { AuthGuard } from './auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { LoginAudit } from './entities/loginAudith.entity';
import { GeoLocationModule } from './geolocation.module';

@Module({
  imports: [
    CommonModule,
    UsersModule,
    RolesModule,
    GeoLocationModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        global: true,
        secret: jwtConstants(configService).secret, // Obtiene el secreto desde jwtConstants
        signOptions: { expiresIn: '2h' },
      }),
    }),
    TypeOrmModule.forFeature([Tokens, LoginAudit]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AuthModule {}
