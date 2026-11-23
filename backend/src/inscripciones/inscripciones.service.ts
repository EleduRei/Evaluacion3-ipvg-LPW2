import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Inscripcion } from './inscripcion.entity';
import { Torneo } from '../torneos/torneo.entity';
import { Equipo } from '../equipos/equipo.entity';
import { Partido } from '../partidos/partido.entity';
import { CrearInscripcionDto } from './dto/crear-inscripcion.dto';
import { UsuarioToken } from '../auth/decorators/usuario-actual.decorator';
import { EstadoInscripcion, EstadoTorneo, Rol } from '../common/enums';

@Injectable()
export class InscripcionesService {
  constructor(
    @InjectRepository(Inscripcion) private readonly inscripcionesRepo: Repository<Inscripcion>,
    @InjectRepository(Torneo) private readonly torneosRepo: Repository<Torneo>,
    @InjectRepository(Equipo) private readonly equiposRepo: Repository<Equipo>,
    @InjectRepository(Partido) private readonly partidosRepo: Repository<Partido>,
  ) {}

  listar(torneoId?: number) {
    return this.inscripcionesRepo.find({
      where: torneoId ? { torneoId } : {},
      relations: { equipo: true, torneo: true },
      order: { fecha: 'ASC' },
    });
  }

  /**
   * Inscribe un equipo en un torneo aplicando las reglas de negocio:
   *  - el torneo y el equipo deben existir (404)
   *  - solo el capitán del equipo o un ADMIN puede inscribirlo (403)
   *  - el período de inscripción debe estar abierto (400)
   *  - el equipo no puede inscribirse dos veces en el mismo torneo (409)
   *  - no se puede superar el cupo máximo (409)
   */
  async crear(dto: CrearInscripcionDto, usuario: UsuarioToken) {
    const torneo = await this.torneosRepo.findOne({ where: { id: dto.torneoId } });
    if (!torneo) throw new NotFoundException(`El torneo ${dto.torneoId} no existe`);

    const equipo = await this.equiposRepo.findOne({ where: { id: dto.equipoId } });
    if (!equipo) throw new NotFoundException(`El equipo ${dto.equipoId} no existe`);

    if (usuario.rol !== Rol.ADMIN && equipo.capitanId !== usuario.sub) {
      throw new ForbiddenException('Solo el capitán del equipo puede inscribirlo');
    }

    if (torneo.estado !== EstadoTorneo.ABIERTO || new Date() > new Date(torneo.cierreInscripcion)) {
      throw new BadRequestException('El período de inscripción de este torneo está cerrado');
    }

    const duplicada = await this.inscripcionesRepo.findOne({
      where: { torneoId: dto.torneoId, equipoId: dto.equipoId },
    });
    if (duplicada) {
      throw new ConflictException(`El equipo "${equipo.nombre}" ya está inscrito en este torneo`);
    }

    
    const ocupados = await this.inscripcionesRepo.count({
      where: {
        torneoId: dto.torneoId,
        estado: In([EstadoInscripcion.PENDIENTE, EstadoInscripcion.ACEPTADA]),
      },
    });
    if (ocupados >= torneo.cupoMaximo) {
      throw new ConflictException(`El torneo alcanzó su cupo máximo de ${torneo.cupoMaximo} equipos`);
    }

    const inscripcion = this.inscripcionesRepo.create({
      torneoId: dto.torneoId,
      equipoId: dto.equipoId,
      estado: EstadoInscripcion.PENDIENTE,
    });
    return this.inscripcionesRepo.save(inscripcion);
  }


  async cambiarEstado(id: number, estado: EstadoInscripcion) {
    const inscripcion = await this.inscripcionesRepo.findOne({
      where: { id },
      relations: { torneo: true, equipo: true },
    });
    if (!inscripcion) throw new NotFoundException(`La inscripción ${id} no existe`);

    if (estado === EstadoInscripcion.ACEPTADA && inscripcion.estado !== EstadoInscripcion.ACEPTADA) {
      const aceptadas = await this.inscripcionesRepo.count({
        where: { torneoId: inscripcion.torneoId, estado: EstadoInscripcion.ACEPTADA },
      });
      if (aceptadas >= inscripcion.torneo.cupoMaximo) {
        throw new ConflictException('No se puede aceptar: el torneo ya completó su cupo');
      }
    }

    if (estado !== EstadoInscripcion.ACEPTADA && (await this.tienePartidos(inscripcion))) {
      throw new ConflictException('El equipo ya tiene partidos en este torneo; no se puede cambiar su inscripción');
    }

    inscripcion.estado = estado;
    return this.inscripcionesRepo.save(inscripcion);
  }

 
  async eliminar(id: number, usuario: UsuarioToken) {
    const inscripcion = await this.inscripcionesRepo.findOne({
      where: { id },
      relations: { equipo: true },
    });
    if (!inscripcion) throw new NotFoundException(`La inscripción ${id} no existe`);
    if (usuario.rol !== Rol.ADMIN && inscripcion.equipo.capitanId !== usuario.sub) {
      throw new ForbiddenException('Solo el capitán del equipo o un administrador pueden retirar la inscripción');
    }
    if (await this.tienePartidos(inscripcion)) {
      throw new ConflictException('El equipo ya tiene partidos en este torneo; no se puede retirar');
    }
    await this.inscripcionesRepo.remove(inscripcion);
    return { mensaje: 'Inscripción eliminada' };
  }

  private async tienePartidos(inscripcion: Inscripcion) {
    const cantidad = await this.partidosRepo.count({
      where: [
        { torneoId: inscripcion.torneoId, equipoLocalId: inscripcion.equipoId },
        { torneoId: inscripcion.torneoId, equipoVisitanteId: inscripcion.equipoId },
      ],
    });
    return cantidad > 0;
  }
}
