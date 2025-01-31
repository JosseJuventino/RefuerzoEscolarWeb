import { Module } from '@nestjs/common';
import { EmailService } from './service/email.service';
import { EmailController } from './controller/email.controller';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from 'src/common/common.module';

@Module({
  controllers: [EmailController],
  providers: [EmailService],
  imports: [
    ConfigModule.forRoot(),
    CommonModule, 
  ],
  exports: [EmailService],
})
export class EmailModule {}