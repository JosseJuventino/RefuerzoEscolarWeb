import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getMetadataArgsStorage } from 'typeorm';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const entities = getMetadataArgsStorage()
          .tables.map((tbl) => tbl.target as new () => unknown)
          .filter((entity) =>
            entity.toString().toLowerCase().includes('entity'),
          );

        return {
          type: 'mongodb',
          url: configService.get('MONGO_URI'),
          database: configService.get('MONGO_DB'),
          entities,
          logging: true,
          autoLoadEntities: true,
          synchronize: true,
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [MongoModule],
})
export class MongoModule {}
