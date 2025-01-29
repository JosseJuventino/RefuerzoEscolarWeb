import { Injectable } from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { CrudHelper } from 'src/common/helper/crud.helper';
import { User } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeneralResponseDto } from 'src/common/dto/general-response.dto';
import { auth } from './entities/auth.entity';
import { GeneralResponseBuilder } from 'src/common/helper/general-response.helper';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Tokens } from './entities/token.entity';
import { CreateTokensDto } from './dto/create-tokens.dto';
import { PageverifyDto } from './dto/pageverify.dto';
import { PermisionOptions, Role } from 'src/roles/entities/role.entity';

@Injectable()
export class AuthService {
  private readonly UsercrudHelper: CrudHelper<User>;
  private readonly authcrudHelper: CrudHelper<Tokens>;
  private readonly rolecrudHelper: CrudHelper<Role>;
  constructor(
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

  async login(authDto: AuthDto): Promise<GeneralResponseDto<auth>> {
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
      name: user.nombres,
      lastName: user.apellidos,
      image: user.image,
    };
    const token = await this.jwtService.sign(payload);

    const salt = await bcrypt.genSalt(10);
    const hashedToken = await bcrypt.hash(token, salt);

    const tokenData: CreateTokensDto = {
      token,
      hash: hashedToken,
    };

    //cargar el nombre y apellido del usuario con su imagen desde el payload y guardar en userData
    const userData = {
      nombreCompleto: payload.name + ' ' + payload.lastName,
      email: payload.email,
      image: user.image,
    };

    const newToken = this.tokensRepository.create(tokenData);
    await this.authcrudHelper.create(newToken);

    // Enriquecer usuario con rol y permisos
    const roleData = await this.rolecrudHelper.findByNameOrId(
      user.role,
      false,
      false,
    );

    // Mapeo para convertir llaves y valores:
    // blog -> 0, usuarios -> 1, programacion -> 2, role -> 3
    // view/edit -> [1/0, 1/0]
    const pagesMap = {
      blog: 0,
      usuarios: 1,
      programacion: 2,
      role: 3,
    };

    const transformedPages = Object.entries(roleData.pages).reduce(
      (acc, [key, value]) => {
        // Si la llave coincide con alguna del pagesMap
        if (pagesMap[key] !== undefined) {
          acc[pagesMap[key]] = [value.view ? 1 : 0, value.edit ? 1 : 0];
        }
        return acc;
      },
      {},
    );

    return (
      new GeneralResponseBuilder<auth>()
        .setStatusCode(200)
        .setMessage('User logged in successfully')
        // Retorna el token encriptado y las páginas transformadas
        .setData({ token: hashedToken, info: userData })
        .build()
    );
  }
}
