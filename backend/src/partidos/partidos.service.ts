import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Partido } from './partido.entity';
import { Torneo } from '../torneos/torneo.entity';
import { Inscripcion } from '../inscripciones/inscripcion.entity';
import { CrearPartidoDto } from './dto/crear-partido.dto';
import { ActualizarPartidoDto } from './dto/actualizar-partido.dto';
import { EstadoInscripcion, EstadoPartido, EstadoTorneo } from '../common/enums';

@Injectable()
export class PartidosService {
  constructor(
    @InjectRepository(Partido) private readonly partidosRepo: Repository<Partido>,
    @InjectRepository(Torneo) private readonly torneosRepo: Repository<Torneo>,
    @InjectRepository(Inscripcion) private readonly inscripcionesRepo: Repository<Inscripcion>,
  ) {}

  listar(torneoId?: number, estado?: EstadoPartido) {
    return this.partidosRepo.find({
      where: { ...(torneoId && { torneoId }), ...(estado && { estado }) },
      relations: { torneo: true, equipoLocal: true, equipoVisitante: true, resultado: true },
      order: { fechaHora: 'ASC' },
    });
  }

  async obtener(id: number) {
    const partido = await this.partidosRepo.findOne({
      where: { id },
      relations: {
        torneo: true,
        equipoLocal: true,
        equipoVisitante: true,
        resultado: { ganador: true, registradoPor: true },
      },
    });
    if (!partido) throw new NotFoundException(`El partido ${id} no existe`);
    return partido;
  }

  /**
   * Programar partido (ADMIN). Reglas:
   *  - el torneo debe existir y no estar finalizado/cancelado
   *  - local y visitante deben ser equipos distintos
   *  - ambos deben tener inscripción ACEPTADA en ese mismo torneo
   */
  async crear(dto: CrearPartidoDto) {
    const torneo = await this.torneosRepo.findOne({ where: { id: dto.torneoId } });
    if (!torneo) throw new NotFoundException(`El torneo ${dto.torneoId} no existe`);
    if (torneo.estado === EstadoTorneo.FINALIZADO || torneo.estado === EstadoTorneo.CANCELADO) {
      throw new BadRequestException('No se pueden programar partidos en un torneo finalizado o cancelado');
    }

    if (dto.equipoLocalId === dto.equipoVisitanteId) {
      throw new BadRequestException('Un partido debe enfrentar a dos equipos distintos');
    }

    const inscritos = await this.inscripcionesRepo.count({
      where: [
        { torneoId: dto.torneoId, equipoId: dto.equipoLocalId, estado: EstadoInscripcion.ACEPTADA },
        { torneoId: dto.torneoId, equipoId: dto.equipoVisitanteId, estado: EstadoInscripcion.ACEPTADA },
      ],
    });
    if (inscritos !== 2) {
      throw new BadRequestException('Ambos equipos deben tener su inscripción aceptada en este torneo');
    }

    const partido = this.partidosRepo.create({
      ...dto,
      fechaHora: new Date(dto.fechaHora),
      estado: EstadoPartido.PROGRAMADO,
    });
    const guardado = await this.partidosRepo.save(partido);
    return this.obtener(guardado.id);
  }

  async actualizar(id: number, dto: ActualizarPartidoDto) {
    const partido = await this.obtener(id);
    if (partido.resultado) {
      throw new BadRequestException('El partido ya tiene resultado oficial; no se puede reprogramar');
    }
    if (dto.estado === EstadoPartido.FINALIZADO) {
      throw new BadRequestException('Un partido se finaliza registrando su resultado oficial');
    }
    await this.partidosRepo.update(id, {
      ...(dto.fechaHora && { fechaHora: new Date(dto.fechaHora) }),
      ...(dto.ronda && { ronda: dto.ronda }),
      ...(dto.estado && { estado: dto.estado }),
    });
    return this.obtener(id);
  }

  async eliminar(id: number) {
    const partido = await this.obtener(id);
    await this.partidosRepo.remove(partido); // el resultado se borra en cascada
    return { mensaje: 'Partido eliminado' };
  }
}
