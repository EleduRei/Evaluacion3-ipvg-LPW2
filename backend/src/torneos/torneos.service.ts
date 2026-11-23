import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Torneo } from './torneo.entity';
import { Inscripcion } from '../inscripciones/inscripcion.entity';
import { Partido } from '../partidos/partido.entity';
import { CrearTorneoDto } from './dto/crear-torneo.dto';
import { ActualizarTorneoDto } from './dto/actualizar-torneo.dto';
import { FiltroTorneosDto } from './dto/filtro-torneos.dto';
import { EstadoInscripcion } from '../common/enums';
import { calcularRanking } from './ranking.util';

@Injectable()
export class TorneosService {
  constructor(
    @InjectRepository(Torneo) private readonly torneosRepo: Repository<Torneo>,
    @InjectRepository(Inscripcion) private readonly inscripcionesRepo: Repository<Inscripcion>,
    @InjectRepository(Partido) private readonly partidosRepo: Repository<Partido>,
  ) {}

  /** Búsqueda por texto + filtros combinables (se agregan solo los que vienen). */
  listar(filtros: FiltroTorneosDto = {}) {
    const qb = this.torneosRepo
      .createQueryBuilder('t')
      .loadRelationCountAndMap('t.inscritos', 't.inscripciones', 'i', (sub) =>
        sub.where('i.estado = :aceptada', { aceptada: EstadoInscripcion.ACEPTADA }),
      )
      .orderBy('t.fechaInicio', 'DESC');

    if (filtros.q) {
      qb.andWhere('(t.nombre LIKE :q OR t.videojuego LIKE :q)', { q: `%${filtros.q}%` });
    }
    if (filtros.videojuego) qb.andWhere('t.videojuego = :videojuego', { videojuego: filtros.videojuego });
    if (filtros.estado) qb.andWhere('t.estado = :estado', { estado: filtros.estado });
    if (filtros.modalidad) qb.andWhere('t.modalidad = :modalidad', { modalidad: filtros.modalidad });

    return qb.getMany();
  }

  async obtener(id: number) {
    const torneo = await this.torneosRepo.findOne({
      where: { id },
      relations: { inscripciones: { equipo: true } },
      order: { inscripciones: { fecha: 'ASC' } },
    });
    if (!torneo) throw new NotFoundException(`El torneo ${id} no existe`);
    torneo.inscritos = torneo.inscripciones.filter((i) => i.estado === EstadoInscripcion.ACEPTADA).length;
    return torneo;
  }

  async crear(dto: CrearTorneoDto) {
    this.validarFechas(dto.cierreInscripcion, dto.fechaInicio);
    const torneo = this.torneosRepo.create({
      ...dto,
      cierreInscripcion: new Date(dto.cierreInscripcion),
    });
    const guardado = await this.torneosRepo.save(torneo);
    return this.obtener(guardado.id);
  }

  async actualizar(id: number, dto: ActualizarTorneoDto) {
    const torneo = await this.obtener(id);
    const cierre = dto.cierreInscripcion ?? torneo.cierreInscripcion.toISOString();
    const inicio = dto.fechaInicio ?? torneo.fechaInicio;
    this.validarFechas(cierre, inicio);

    if (dto.cupoMaximo !== undefined && dto.cupoMaximo < torneo.inscritos) {
      throw new BadRequestException(
        `El cupo no puede ser menor a los ${torneo.inscritos} equipos ya aceptados`,
      );
    }

    await this.torneosRepo.update(id, {
      ...dto,
      ...(dto.cierreInscripcion && { cierreInscripcion: new Date(dto.cierreInscripcion) }),
    });
    return this.obtener(id);
  }

  async eliminar(id: number) {
    const torneo = await this.obtener(id);
    // onDelete CASCADE elimina también inscripciones, partidos y resultados
    await this.torneosRepo.remove(torneo);
    return { mensaje: `Torneo "${torneo.nombre}" eliminado` };
  }

  /** Tabla de posiciones calculada desde los resultados oficiales. */
  async ranking(id: number) {
    const torneo = await this.obtener(id);
    const equipos = torneo.inscripciones
      .filter((i) => i.estado === EstadoInscripcion.ACEPTADA)
      .map((i) => ({ id: i.equipo.id, nombre: i.equipo.nombre }));

    const partidos = await this.partidosRepo.find({
      where: { torneoId: id },
      relations: { resultado: true },
    });
    return calcularRanking(equipos, partidos);
  }

  private validarFechas(cierreInscripcion: string, fechaInicio: string) {
    // El cierre de inscripciones debe ser antes de que termine el día de inicio
    const cierre = new Date(cierreInscripcion);
    const finDiaInicio = new Date(`${fechaInicio}T23:59:59`);
    if (cierre > finDiaInicio) {
      throw new BadRequestException('El cierre de inscripción debe ser anterior o igual a la fecha de inicio');
    }
  }
}
