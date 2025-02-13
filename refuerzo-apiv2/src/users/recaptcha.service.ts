import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class RecaptchaService {
  private readonly recaptchaSecret: string = process.env.RECAPTCHA_SECRET_KEY;

  async verifyRecaptcha(token: string): Promise<boolean> {
    try {
      const response = await axios.post(
        `https://www.google.com/recaptcha/api/siteverify?secret=${this.recaptchaSecret}&response=${token}`
      );

      const { success, score } = response.data;

      if (!success || score < 0.5) {
        throw new HttpException('reCAPTCHA verification failed', HttpStatus.BAD_REQUEST);
      }

      return true;
    } catch (error) {
      throw new HttpException('Error verifying reCAPTCHA', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}