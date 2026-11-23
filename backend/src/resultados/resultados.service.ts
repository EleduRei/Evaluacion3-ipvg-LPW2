import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resultado } from './resultado.entity';
import { Partido } from '../partidos/partido.entity';
import { RegistrarResultadoDto } from './dto/registrar-resultado.dto';
import { UsuarioToken } from '../auth/decorators/usuario-actual.decorator';
import { EstadoPartido, Modalidad } from '../common/enums';

@Injectable()
export class ResultadosService {
  constructor(
    @InjectRepository(Resultado) private readonly resultadosRepo: Repository<Resultado>,
    @InjectRepository(Partido) private readonly partidosRepo: Repository<Partido>,
  ) {}

  /**
   * Registra el resultado oficial (ADMIN). Reglas:
   *  - el partido debe existir (404)
   *  - no puede tener ya un resultado (409)
   *  - no puede estar cancelado (400)
   *  - en ELIMINACION no se permite empate (400)
   * Luego el partido pasa a FINALIZADO y el ranking se recalcula solo
   * (porque se calcula siempre desde la tabla resultados).
   */
  async registrar(partidoId: number, dto: RegistrarResultadoDto, usuario: UsuarioToken) {
    const partido = await this.buscarPartido(partidoId);
    if (partido.resultado) {
      throw new ConflictException('Este partido ya tiene un resultado oficial registrado');
    }
    if (partido.estado === EstadoPartido.CANCELADO) {
      throw new BadRequestException('No se puede registrar resultado en un partido cancelado');
    }
    const ganadorId = this.calcularGanador(partido, dto);

    const resultado = this.resultadosRepo.create({
      partidoId,
      puntajeLocal: dto.puntajeLocal,
      puntajeVisitante: dto.puntajeVisitante,
      ganadorId,
      registradoPorId: usuario.sub,
    });
    await this.resultadosRepo.save(resultado);

    await this.partidosRepo.update(partidoId, { estado: EstadoPartido.FINALIZADO });
    return this.obtenerPorPartido(partidoId);
  }

  /** Corregir un resultado ya registrado (ADMIN). */
  async corregir(partidoId: number, dto: RegistrarResultadoDto, usuario: UsuarioToken) {
    const partido = await this.buscarPartido(partidoId);
    if (!partido.resultado) {
      throw new NotFoundException('El partido aún no tiene resultado para corregir');
    }
    await this.resultadosRepo.update(partido.resultado.id, {
      puntajeLocal: dto.puntajeLocal,
      puntajeVisitante: dto.puntajeVisitante,
      ganadorId: this.calcularGanador(partido, dto),
      registradoPorId: usuario.sub,
    });
    return this.obtenerPorPartido(partidoId);
  }

  /** Anular un resultado: el partido vuelve a PROGRAMADO (ADMIN). */
  async anular(partidoId: number) {
    const partido = await this.buscarPartido(partidoId);
    if (!partido.resultado) throw new NotFoundException('El partido no tiene resultado registrado');
    await this.resultadosRepo.delete(partido.resultado.id);
    await this.partidosRepo.update(partidoId, { estado: EstadoPartido.PROGRAMADO });
    return { mensaje: 'Resultado anulado; el partido vuelve a estado PROGRAMADO' };
  }

  async obtenerPorPartido(partidoId: number) {
    const resultado = await this.resultadosRepo.findOne({
      where: { partidoId },
      relations: { ganador: true, registradoPor: true },
    });
    if (!resultado) throw new NotFoundException('El partido no tiene resultado registrado');
    return resultado;
  }

  /** Devuelve el id del ganador o null si es empate (validando la modalidad). */
  calcularGanador(partido: Partido, dto: RegistrarResultadoDto): number | null {
    if (dto.puntajeLocal === dto.puntajeVisitante) {
      if (partido.torneo.modalidad === Modalidad.ELIMINACION) {
        throw new BadRequestException('En modalidad eliminación directa no se permite empate');
      }
      return null;
    }
    return dto.puntajeLocal > dto.puntajeVisitante ? partido.equipoLocalId : partido.equipoVisitanteId;
  }

  private async buscarPartido(partidoId: number) {
    const partido = await this.partidosRepo.findOne({
      where: { id: partidoId },
      relations: { torneo: true, resultado: true },
    });
    if (!partido) throw new NotFoundException(`El partido ${partidoId} no existe`);
    return partido;
  }
}
