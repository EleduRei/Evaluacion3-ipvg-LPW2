import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Equipo } from './equipo.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { Partido } from '../partidos/partido.entity';
import { CrearEquipoDto } from './dto/crear-equipo.dto';
import { ActualizarEquipoDto } from './dto/actualizar-equipo.dto';
import { UsuarioToken } from '../auth/decorators/usuario-actual.decorator';
import { Rol } from '../common/enums';

@Injectable()
export class EquiposService {
  constructor(
    @InjectRepository(Equipo) private readonly equiposRepo: Repository<Equipo>,
    @InjectRepository(Usuario) private readonly usuariosRepo: Repository<Usuario>,
    @InjectRepository(Partido) private readonly partidosRepo: Repository<Partido>,
  ) {}

  listar() {
    return this.equiposRepo.find({
      relations: { capitan: true, integrantes: true },
      order: { nombre: 'ASC' },
    });
  }

  async obtener(id: number) {
    const equipo = await this.equiposRepo.findOne({
      where: { id },
      relations: { capitan: true, integrantes: true, inscripciones: { torneo: true } },
    });
    if (!equipo) throw new NotFoundException(`El equipo ${id} no existe`);
    return equipo;
  }

  /** Quien crea el equipo queda como capitán e integrante. */
  async crear(dto: CrearEquipoDto, usuario: UsuarioToken) {
    await this.validarNombreUnico(dto.nombre);
    const capitan = await this.usuariosRepo.findOne({ where: { id: usuario.sub } });
    if (!capitan) throw new NotFoundException('Usuario autenticado no encontrado');

    const equipo = this.equiposRepo.create({
      nombre: dto.nombre.trim(),
      juegoPreferido: dto.juegoPreferido.trim(),
      capitan,
      integrantes: [capitan],
    });
    const guardado = await this.equiposRepo.save(equipo);
    return this.obtener(guardado.id);
  }

  async actualizar(id: number, dto: ActualizarEquipoDto, usuario: UsuarioToken) {
    const equipo = await this.obtener(id);
    this.verificarPermiso(equipo, usuario);
    if (dto.nombre && dto.nombre !== equipo.nombre) await this.validarNombreUnico(dto.nombre, id);

   
    await this.equiposRepo.update(id, {
      ...(dto.nombre && { nombre: dto.nombre.trim() }),
      ...(dto.juegoPreferido && { juegoPreferido: dto.juegoPreferido.trim() }),
      ...(dto.estado && { estado: dto.estado }),
    });
    return this.obtener(id);
  }

  async eliminar(id: number, usuario: UsuarioToken) {
    const equipo = await this.obtener(id);
    this.verificarPermiso(equipo, usuario);

    const partidos = await this.partidosRepo.count({
      where: [{ equipoLocalId: id }, { equipoVisitanteId: id }],
    });
    if (partidos > 0) {
      throw new ConflictException('No se puede eliminar un equipo que ya tiene partidos programados o jugados');
    }
    await this.equiposRepo.remove(equipo);
    return { mensaje: `Equipo "${equipo.nombre}" eliminado` };
  }

  async agregarIntegrante(id: number, usuarioId: number, usuario: UsuarioToken) {
    const equipo = await this.obtener(id);
    this.verificarPermiso(equipo, usuario);

    const nuevo = await this.usuariosRepo.findOne({ where: { id: usuarioId } });
    if (!nuevo) throw new NotFoundException(`El usuario ${usuarioId} no existe`);
    if (equipo.integrantes.some((i) => i.id === usuarioId)) {
      throw new ConflictException(`${nuevo.alias} ya es integrante del equipo`);
    }
    equipo.integrantes.push(nuevo);
    await this.equiposRepo.save(equipo);
    return this.obtener(id);
  }

  async quitarIntegrante(id: number, usuarioId: number, usuario: UsuarioToken) {
    const equipo = await this.obtener(id);
    this.verificarPermiso(equipo, usuario);

    if (usuarioId === equipo.capitanId) {
      throw new BadRequestException('No se puede quitar al capitán del equipo');
    }
    if (!equipo.integrantes.some((i) => i.id === usuarioId)) {
      throw new NotFoundException('Ese usuario no es integrante del equipo');
    }
    equipo.integrantes = equipo.integrantes.filter((i) => i.id !== usuarioId);
    await this.equiposRepo.save(equipo);
    return this.obtener(id);
  }

  
  private verificarPermiso(equipo: Equipo, usuario: UsuarioToken) {
    if (usuario.rol !== Rol.ADMIN && equipo.capitanId !== usuario.sub) {
      throw new ForbiddenException('Solo el capitán del equipo o un administrador pueden modificarlo');
    }
  }

  private async validarNombreUnico(nombre: string, idActual?: number) {
    const existe = await this.equiposRepo.findOne({
      where: { nombre: nombre.trim(), ...(idActual && { id: Not(idActual) }) },
    });
    if (existe) throw new ConflictException('Ya existe un equipo con ese nombre');
  }
}
