import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { Usuario } from '../usuarios/usuario.entity';
import { Rol } from '../common/enums';

describe('AuthService (registro e inicio de sesión)', () => {
  let service: AuthService;
  let usuarioEnBd: any;

  
  const queryBuilder = {
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn(async () => usuarioEnBd),
  };
  const usuariosRepo = {
    findOne: jest.fn(),
    create: jest.fn((d) => d),
    save: jest.fn(async (d) => ({ id: 1, ...d })),
    createQueryBuilder: jest.fn(() => queryBuilder),
  };
  const jwtService = { sign: jest.fn(() => 'token-de-prueba') };

  beforeEach(async () => {
    jest.clearAllMocks();
    usuarioEnBd = {
      id: 1, nombre: 'Admin', alias: 'admin', correo: 'admin@ipvg.cl',
      password: await bcrypt.hash('Admin123!', 4), rol: Rol.ADMIN, activo: true,
    };
    const modulo = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(Usuario), useValue: usuariosRepo },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();
    service = modulo.get(AuthService);
  });

  it('login correcto devuelve token y datos sin la contraseña', async () => {
    const respuesta = await service.login({ correo: 'admin@ipvg.cl', password: 'Admin123!' });
    expect(respuesta.access_token).toBe('token-de-prueba');
    expect(respuesta.usuario).not.toHaveProperty('password');
    expect(respuesta.usuario.rol).toBe(Rol.ADMIN);
  });

  it('login con contraseña incorrecta responde 401', async () => {
    await expect(
      service.login({ correo: 'admin@ipvg.cl', password: 'otraClave' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('el registro siempre crea usuarios con rol ESTUDIANTE y contraseña cifrada', async () => {
    usuariosRepo.findOne.mockResolvedValue(null);
    await service.registro({ nombre: 'Ana', alias: 'ana', correo: 'ANA@ipvg.cl', password: 'Clave123' });
    const guardado = usuariosRepo.save.mock.calls[0][0];
    expect(guardado.rol).toBe(Rol.ESTUDIANTE);
    expect(guardado.correo).toBe('ana@ipvg.cl');
    expect(guardado.password).not.toBe('Clave123');
  });

  it('no permite registrar un correo existente (409)', async () => {
    usuariosRepo.findOne.mockResolvedValueOnce({ id: 2 });
    await expect(
      service.registro({ nombre: 'Ana', alias: 'ana', correo: 'ana@ipvg.cl', password: 'Clave123' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
