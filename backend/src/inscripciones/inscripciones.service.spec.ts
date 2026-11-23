import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InscripcionesService } from './inscripciones.service';
import { Inscripcion } from './inscripcion.entity';
import { Torneo } from '../torneos/torneo.entity';
import { Equipo } from '../equipos/equipo.entity';
import { Partido } from '../partidos/partido.entity';
import { EstadoInscripcion, EstadoTorneo, Rol } from '../common/enums';


const crearRepoMock = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  count: jest.fn(),
  create: jest.fn((datos) => datos),
  save: jest.fn(async (datos) => ({ id: 100, ...datos })),
  remove: jest.fn(),
});

describe('InscripcionesService (reglas de negocio)', () => {
  let service: InscripcionesService;
  let inscRepo: ReturnType<typeof crearRepoMock>;
  let torneosRepo: ReturnType<typeof crearRepoMock>;
  let equiposRepo: ReturnType<typeof crearRepoMock>;

  const capitan = { sub: 5, correo: 'cap@ipvg.cl', alias: 'cap', rol: Rol.ESTUDIANTE };
  const manana = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const torneoAbierto = { id: 1, cupoMaximo: 2, estado: EstadoTorneo.ABIERTO, cierreInscripcion: manana };
  const equipo = { id: 10, nombre: 'Ñuble Esports', capitanId: 5 };

  beforeEach(async () => {
    inscRepo = crearRepoMock();
    torneosRepo = crearRepoMock();
    equiposRepo = crearRepoMock();

    const modulo = await Test.createTestingModule({
      providers: [
        InscripcionesService,
        { provide: getRepositoryToken(Inscripcion), useValue: inscRepo },
        { provide: getRepositoryToken(Torneo), useValue: torneosRepo },
        { provide: getRepositoryToken(Equipo), useValue: equiposRepo },
        { provide: getRepositoryToken(Partido), useValue: crearRepoMock() },
      ],
    }).compile();
    service = modulo.get(InscripcionesService);

   
    torneosRepo.findOne.mockResolvedValue(torneoAbierto);
    equiposRepo.findOne.mockResolvedValue(equipo);
    inscRepo.findOne.mockResolvedValue(null); 
    inscRepo.count.mockResolvedValue(0); 
  });

  it('inscribe al equipo con estado PENDIENTE cuando se cumplen todas las reglas', async () => {
    const resultado = await service.crear({ torneoId: 1, equipoId: 10 }, capitan);
    expect(resultado.estado).toBe(EstadoInscripcion.PENDIENTE);
    expect(inscRepo.save).toHaveBeenCalledTimes(1);
  });

  it('rechaza la inscripción duplicada del mismo equipo en el mismo torneo (409)', async () => {
    inscRepo.findOne.mockResolvedValue({ id: 3, torneoId: 1, equipoId: 10 });
    await expect(service.crear({ torneoId: 1, equipoId: 10 }, capitan)).rejects.toBeInstanceOf(ConflictException);
    expect(inscRepo.save).not.toHaveBeenCalled();
  });

  it('rechaza la inscripción si el torneo alcanzó su cupo máximo (409)', async () => {
    inscRepo.count.mockResolvedValue(2); // cupoMaximo = 2
    await expect(service.crear({ torneoId: 1, equipoId: 10 }, capitan)).rejects.toThrow('cupo máximo');
  });

  it('rechaza la inscripción si el período de inscripción ya cerró (400)', async () => {
    torneosRepo.findOne.mockResolvedValue({ ...torneoAbierto, cierreInscripcion: new Date('2020-01-01') });
    await expect(service.crear({ torneoId: 1, equipoId: 10 }, capitan)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rechaza si quien inscribe no es el capitán del equipo (403)', async () => {
    const otro = { ...capitan, sub: 99 };
    await expect(service.crear({ torneoId: 1, equipoId: 10 }, otro)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('responde 404 si el torneo no existe', async () => {
    torneosRepo.findOne.mockResolvedValue(null);
    await expect(service.crear({ torneoId: 999, equipoId: 10 }, capitan)).rejects.toBeInstanceOf(NotFoundException);
  });
});
