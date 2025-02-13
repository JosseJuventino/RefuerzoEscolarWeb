import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class RecaptchaService {
  private readonly recaptchaSecret: string = process.env.RECAPTCHA_SECRET_KEY;

  async verifyRecaptcha(token: string): Promise<boolean> {
    if (!token) {
      throw new HttpException('Token de reCAPTCHA no proporcionado', HttpStatus.BAD_REQUEST);
    }

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
      console.error("Error en verifyRecaptcha:", error); // Depuración
      throw new HttpException('Error verificando reCAPTCHA', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}