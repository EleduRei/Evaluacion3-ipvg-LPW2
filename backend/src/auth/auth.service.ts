import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Usuario } from '../usuarios/usuario.entity';
import { Rol } from '../common/enums';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';
import { UsuarioToken } from './decorators/usuario-actual.decorator';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario) private readonly usuariosRepo: Repository<Usuario>,
    private readonly jwtService: JwtService,
  ) {}

  
  async registro(dto: RegistroDto) {
    const correo = dto.correo.toLowerCase().trim();
    if (await this.usuariosRepo.findOne({ where: { correo } })) {
      throw new ConflictException('Ya existe una cuenta con ese correo');
    }
    if (await this.usuariosRepo.findOne({ where: { alias: dto.alias } })) {
      throw new ConflictException('El alias ya está en uso');
    }

    const usuario = this.usuariosRepo.create({
      nombre: dto.nombre.trim(),
      alias: dto.alias.trim(),
      correo,
      password: await bcrypt.hash(dto.password, 10),
      rol: Rol.ESTUDIANTE,
    });
    const guardado = await this.usuariosRepo.save(usuario);
    return this.generarRespuesta(guardado);
  }

  async login(dto: LoginDto) {
    
    const usuario = await this.usuariosRepo
      .createQueryBuilder('u')
      .addSelect('u.password')
      .where('u.correo = :correo', { correo: dto.correo.toLowerCase().trim() })
      .getOne();

    const valido = usuario && (await bcrypt.compare(dto.password, usuario.password));
    if (!valido) {
      
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }
    if (!usuario.activo) {
      throw new UnauthorizedException('La cuenta está desactivada');
    }
    return this.generarRespuesta(usuario);
  }

  private generarRespuesta(usuario: Usuario) {
    const payload: UsuarioToken = {
      sub: usuario.id,
      correo: usuario.correo,
      alias: usuario.alias,
      rol: usuario.rol,
    };
    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        alias: usuario.alias,
        correo: usuario.correo,
        rol: usuario.rol,
      },
    };
  }
}
