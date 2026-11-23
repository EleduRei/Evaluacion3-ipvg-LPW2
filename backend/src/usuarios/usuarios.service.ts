import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Usuario } from './usuario.entity';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto';

@Injectable()
export class UsuariosService {
  constructor(@InjectRepository(Usuario) private readonly usuariosRepo: Repository<Usuario>) {}

  /** Lista básica (sin contraseñas) para buscar integrantes de un equipo. */
  listar() {
    return this.usuariosRepo.find({
      select: ['id', 'nombre', 'alias', 'correo', 'rol', 'activo'],
      order: { nombre: 'ASC' },
    });
  }

  async obtenerPerfil(id: number) {
    const usuario = await this.usuariosRepo.findOne({
      where: { id },
      relations: { equipos: true, equiposCapitaneados: true },
    });
    if (!usuario) throw new NotFoundException(`Usuario ${id} no encontrado`);
    return usuario;
  }

  async actualizarPerfil(id: number, dto: ActualizarPerfilDto) {
    const usuario = await this.usuariosRepo.findOne({ where: { id } });
    if (!usuario) throw new NotFoundException(`Usuario ${id} no encontrado`);

    if (dto.alias && dto.alias !== usuario.alias) {
      const enUso = await this.usuariosRepo.findOne({ where: { alias: dto.alias, id: Not(id) } });
      if (enUso) throw new ConflictException('El alias ya está en uso');
      usuario.alias = dto.alias.trim();
    }
    if (dto.nombre) usuario.nombre = dto.nombre.trim();
    if (dto.password) usuario.password = await bcrypt.hash(dto.password, 10);

    await this.usuariosRepo.save(usuario);
    return this.obtenerPerfil(id);
  }

  async cambiarActivo(id: number, activo: boolean) {
    const usuario = await this.usuariosRepo.findOne({ where: { id } });
    if (!usuario) throw new NotFoundException(`Usuario ${id} no encontrado`);
    usuario.activo = activo;
    await this.usuariosRepo.save(usuario);
    return { id: usuario.id, activo: usuario.activo };
  }
}
