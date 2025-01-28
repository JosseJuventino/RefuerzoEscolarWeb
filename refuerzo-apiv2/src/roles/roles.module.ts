import { forwardRef, Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from 'src/common/common.module';
import { Role } from './entities/role.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [RolesController],
  providers: [RolesService],
  imports: [
    CommonModule,
    forwardRef(() => UsersModule),
    TypeOrmModule.forFeature([Role]),
  ],
  exports: [TypeOrmModule],
})
export class RolesModule {}
