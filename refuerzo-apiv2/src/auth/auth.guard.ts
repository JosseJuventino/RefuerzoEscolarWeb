import {
  CanActivate,
  ConflictException,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Tokens } from './entities/token.entity';
import { Repository } from 'typeorm';
import { CrudHelper } from 'src/common/helper/crud.helper';
import { Page, Role } from 'src/roles/entities/role.entity';
import { User } from 'src/users/entities/user.entity';
import { AutenticationGuard } from 'nest_autorization';

@Injectable()
export class AuthGuard extends AutenticationGuard {
  private readonly authcrudHelper: CrudHelper<Tokens>;
  private readonly userscrudHelper: CrudHelper<User>;
  private readonly rolescrudHelper: CrudHelper<Role>;
  constructor(
    reflector: Reflector,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(Tokens)
    private readonly tokensRepository: Repository<Tokens>,
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {
    super(reflector);
    this.userscrudHelper = new CrudHelper<User>(this.usersRepository, 'Users');
    this.rolescrudHelper = new CrudHelper<Role>(this.rolesRepository, 'Roles');

    this.authcrudHelper = new CrudHelper<Tokens>(
      this.tokensRepository,
      'Tokens',
    );
  }

  async validateUserPermissions(
    context: ExecutionContext,
    resource: string,
    requiredScopes: string[],
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException(
        'No se ha proporcionado un token de acceso',
      );
    }

    // Verificar y obtener el payload del token
    const jwtToken = await this.authcrudHelper.findOne({
      where: { hash: token },
    });
    const secret = this.configService.get<string>('JWT');
    const payload = await this.jwtService.verifyAsync(jwtToken.token, {
      secret: secret,
    });

    // Asignar el payload al objeto request
    request['user'] = payload;

    const user = await this.userscrudHelper.findByNameOrId(payload.id);
    if (!user) {
      throw new UnauthorizedException();
    }

    const roles = await this.rolescrudHelper.findByNameOrId(user.role);

    //Quiero que si resources es dashboard valide que todos las keys tengan el valor de true en view
    if (resource === 'dashboard') {
      const requiredScopes = Object.keys(roles.pages);
      const hasAllPermissions = requiredScopes.some(
        (scope) => roles.pages[scope].view || roles.pages[scope].edit,
      );
      if (!hasAllPermissions) {
        return false;
      }
      return true;
    }

    //Verificar que la page exista y que todos los scopes esten en true
    return (
      roles.pages &&
      roles.pages[resource] &&
      requiredScopes.every((scope) => roles.pages[resource][scope])
    );
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
