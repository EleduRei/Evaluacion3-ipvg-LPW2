import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { ResultadosService } from './resultados.service';
import { Resultado } from './resultado.entity';
import { Partido } from '../partidos/partido.entity';
import { EstadoPartido, Modalidad, Rol } from '../common/enums';

describe('ResultadosService (registro de resultados oficiales)', () => {
  let service: ResultadosService;
  const resultadosRepo = {
    create: jest.fn((d) => d),
    save: jest.fn(async (d) => ({ id: 1, ...d })),
    findOne: jest.fn(async () => ({ id: 1 })),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const partidosRepo = { findOne: jest.fn(), update: jest.fn() };
  const admin = { sub: 1, correo: 'admin@ipvg.cl', alias: 'admin', rol: Rol.ADMIN };

  const partidoBase = (modalidad: Modalidad) => ({
    id: 7,
    equipoLocalId: 1,
    equipoVisitanteId: 2,
    estado: EstadoPartido.PROGRAMADO,
    torneo: { modalidad },
    resultado: null,
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    const modulo = await Test.createTestingModule({
      providers: [
        ResultadosService,
        { provide: getRepositoryToken(Resultado), useValue: resultadosRepo },
        { provide: getRepositoryToken(Partido), useValue: partidosRepo },
      ],
    }).compile();
    service = modulo.get(ResultadosService);
  });

  it('calcula automáticamente al ganador y finaliza el partido', async () => {
    partidosRepo.findOne.mockResolvedValue(partidoBase(Modalidad.LIGA));
    await service.registrar(7, { puntajeLocal: 1, puntajeVisitante: 3 }, admin);

    expect(resultadosRepo.save).toHaveBeenCalledWith(expect.objectContaining({ ganadorId: 2 }));
    expect(partidosRepo.update).toHaveBeenCalledWith(7, { estado: EstadoPartido.FINALIZADO });
  });

  it('registra empate (ganadorId null) en modalidad LIGA', async () => {
    partidosRepo.findOne.mockResolvedValue(partidoBase(Modalidad.LIGA));
    await service.registrar(7, { puntajeLocal: 2, puntajeVisitante: 2 }, admin);
    expect(resultadosRepo.save).toHaveBeenCalledWith(expect.objectContaining({ ganadorId: null }));
  });

  it('no permite empate en modalidad ELIMINACION (400)', async () => {
    partidosRepo.findOne.mockResolvedValue(partidoBase(Modalidad.ELIMINACION));
    await expect(
      service.registrar(7, { puntajeLocal: 1, puntajeVisitante: 1 }, admin),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('no permite registrar dos veces el resultado del mismo partido (409)', async () => {
    partidosRepo.findOne.mockResolvedValue({ ...partidoBase(Modalidad.LIGA), resultado: { id: 5 } });
    await expect(
      service.registrar(7, { puntajeLocal: 1, puntajeVisitante: 0 }, admin),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('responde 404 si el partido no existe', async () => {
    partidosRepo.findOne.mockResolvedValue(null);
    await expect(
      service.registrar(999, { puntajeLocal: 1, puntajeVisitante: 0 }, admin),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
