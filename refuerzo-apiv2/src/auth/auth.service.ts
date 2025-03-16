import { Injectable } from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { CrudHelper } from 'src/common/helper/crud.helper';
import { User } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { GeneralResponseDto } from 'src/common/dto/general-response.dto';
import { auth } from './entities/auth.entity';
import { GeneralResponseBuilder } from 'src/common/helper/general-response.helper';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Tokens } from './entities/token.entity';
import { CreateTokensDto } from './dto/create-tokens.dto';
import { PageverifyDto } from './dto/pageverify.dto';
import { PermisionOptions, Role } from 'src/roles/entities/role.entity';
import { LoginAudit } from './entities/loginAudith.entity';
import { GeoLocationService } from './geolocation.service';
import { UAParser } from 'ua-parser-js';
import { MongoRepository } from 'typeorm'; // Importa MongoRepository

@Injectable()
export class AuthService {
  private readonly UsercrudHelper: CrudHelper<User>;
  private readonly authcrudHelper: CrudHelper<Tokens>;
  private readonly rolecrudHelper: CrudHelper<Role>;
  constructor(
    @InjectRepository(LoginAudit)
    private readonly loginAuditRepository: MongoRepository<LoginAudit>,
    private readonly geoLocationService: GeoLocationService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Tokens)
    private readonly tokensRepository: Repository<Tokens>,
    private jwtService: JwtService,
  ) {
    this.UsercrudHelper = new CrudHelper<User>(this.userRepository, 'Users');
    this.authcrudHelper = new CrudHelper<Tokens>(
      this.tokensRepository,
      'Tokens',
    );
    this.rolecrudHelper = new CrudHelper<Role>(this.roleRepository, 'Roles');
  }

  async login(
    authDto: AuthDto,
    ipAddress: string,
    userAgent: string,
  ): Promise<GeneralResponseDto<auth>> {
    const user = await this.UsercrudHelper.findOne(
      {
        where: { email: authDto.email },
      },
      false,
    );

    if (!user) {
      return new GeneralResponseBuilder<auth>()
        .setStatusCode(401)
        .setMessage('Invalid email or password')
        .build();
    }

    const isPasswordValid = await bcrypt.compare(
      authDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      return new GeneralResponseBuilder<auth>()
        .setStatusCode(401)
        .setMessage('Invalid email or password')
        .build();
    }
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.nombre,
      image: user.image,
      idDependingRole: user.idDependingRole || null,
    };
    const token = await this.jwtService.sign(payload);

    const salt = await bcrypt.genSalt(10);
    const hashedToken = await bcrypt.hash(token, salt);

    const tokenData: CreateTokensDto = {
      token,
      hash: hashedToken,
    };

    const role = await this.rolecrudHelper.findByNameOrId(
      payload.role,
      false,
      false,
    );

    const userData = {
      nombreCompleto: payload.name,
      email: payload.email,
      role: role.name,
      image: user.image,
      isActive: user.isActive,
    };

    const newToken = this.tokensRepository.create(tokenData);
    await this.authcrudHelper.create(newToken);

    const location = this.geoLocationService.getLocation(ipAddress);
    const parser = new UAParser(userAgent);
    const result = parser.getResult();
    const device = result.device.type || 'Desktop';
    const browser = result.browser.name || 'Unknown';

    this.logLoginAttempt(
      user._id.toString(),
      user.email,
      device,
      browser,
      location.country,
    ).catch((error) => {
      console.error('Error en auditoría:', error);
    });


    return (
      new GeneralResponseBuilder<auth>()
        .setStatusCode(200)
        .setMessage('User logged in successfully')
        // Retorna el token encriptado y las páginas transformadas
        .setData({ token: hashedToken, info: userData })
        .build()
    );
  }

  private async logLoginAttempt(
    userId: string,
    email: string,
    device: string,
    browser: string,
    country: string,
  ): Promise<void> {
    try {
      // 1. Insertar nuevo registro
      await this.loginAuditRepository.insert({
        userId,
        email,
        device,
        browser,
        country,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // 2. Buscar el 4to registro más antiguo
      const fourthLog = await this.loginAuditRepository.find({
        where: { userId },
        order: { createdAt: -1 }, // Ordena de más reciente a más antiguo
        skip: 3,
        take: 1,
      });

      // 3. Eliminar registros antiguos (si existen)
      if (fourthLog.length > 0) {
        const cutoffDate = fourthLog[0].createdAt;

        // Usar operadores de MongoDB directamente
        await this.loginAuditRepository.deleteMany({
          userId,
          createdAt: { $lte: cutoffDate }, 
        });
      }
    } catch (error) {
      console.error('Error en logLoginAttempt:', error);
    }
  }

  async getAuditLogsByUser(
    userId: string,
  ): Promise<GeneralResponseDto<LoginAudit[]>> {
    const logs = await this.loginAuditRepository.find({
      //where user id is equal to the user id and expired is not defined and not true
      where: { userId, expired: undefined },
      order: { createdAt: 'DESC' },
    });

    return new GeneralResponseBuilder<LoginAudit[]>()
      .setStatusCode(200)
      .setMessage('Logs de auditoría obtenidos exitosamente')
      .setData(logs)
      .build();
  }
}
