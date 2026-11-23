/**
 * Carga datos de prueba en MySQL.  Uso:  npm run seed
 * ATENCIÓN: borra y vuelve a crear todas las tablas (synchronize(true)).
 *
 * Cuentas creadas:
 *   ADMIN       admin@ipvg.cl            / Admin123!
 *   ESTUDIANTES estudiante1..10@ipvg.cl  / Estudiante123!
 */
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { AppModule } from '../app.module';
import { Usuario } from '../usuarios/usuario.entity';
import { Equipo } from '../equipos/equipo.entity';
import { Torneo } from '../torneos/torneo.entity';
import { Inscripcion } from '../inscripciones/inscripcion.entity';
import { Partido } from '../partidos/partido.entity';
import { Resultado } from '../resultados/resultado.entity';
import {
  EstadoInscripcion,
  EstadoPartido,
  EstadoTorneo,
  Modalidad,
  Rol,
} from '../common/enums';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
  const ds = app.get(DataSource);

  console.log('> Reiniciando esquema (DROP + CREATE de tablas)...');
  await ds.synchronize(true);

  const usuariosRepo = ds.getRepository(Usuario);
  const equiposRepo = ds.getRepository(Equipo);
  const torneosRepo = ds.getRepository(Torneo);
  const inscRepo = ds.getRepository(Inscripcion);
  const partidosRepo = ds.getRepository(Partido);
  const resultadosRepo = ds.getRepository(Resultado);

  // ---------- Usuarios ----------
  const admin = await usuariosRepo.save(
    usuariosRepo.create({
      nombre: 'Administrador GameHub',
      alias: 'admin',
      correo: 'admin@ipvg.cl',
      password: await bcrypt.hash('Admin123!', 10),
      rol: Rol.ADMIN,
    }),
  );

  const hashEst = await bcrypt.hash('Estudiante123!', 10);
  const nombres: [string, string][] = [
    ['Camila Rojas', 'camiGG'],
    ['Benjamín Soto', 'benja_s'],
    ['Valentina Muñoz', 'valemu'],
    ['Matías Fuentes', 'matiFX'],
    ['Fernanda Díaz', 'ferdz'],
    ['Tomás Contreras', 'tomcon'],
    ['Josefa Sepúlveda', 'jose_sp'],
    ['Diego Vergara', 'dverg'],
    ['Ignacia Torres', 'nachaT'],
    ['Lucas Morales', 'lukem'],
  ];
  const est: Usuario[] = [];
  for (const [i, [nombre, alias]] of nombres.entries()) {
    est.push(
      await usuariosRepo.save(
        usuariosRepo.create({
          nombre,
          alias,
          correo: `estudiante${i + 1}@ipvg.cl`,
          password: hashEst,
          rol: Rol.ESTUDIANTE,
        }),
      ),
    );
  }

  // ---------- Equipos (capitán + integrantes) ----------
  const crearEquipo = (nombre: string, juego: string, capitan: Usuario, otros: Usuario[]) =>
    equiposRepo.save(
      equiposRepo.create({ nombre, juegoPreferido: juego, capitan, integrantes: [capitan, ...otros] }),
    );
  const nuble = await crearEquipo('Ñuble Esports', 'Rocket League', est[0], [est[1]]);
  const chillanejos = await crearEquipo('Los Chillanejos', 'Rocket League', est[2], [est[3]]);
  const itata = await crearEquipo('Itata Gaming', 'Valorant', est[4], [est[5]]);
  const cordillera = await crearEquipo('Cordillera FC', 'EA Sports FC 25', est[6], [est[7]]);
  const legends = await crearEquipo('Virginio Legends', 'Valorant', est[8], [est[9]]);
  const bandits = await crearEquipo('Bit Bandits', 'Rocket League', est[3], [est[0]]);

  // ---------- Torneos ----------
  const t1 = await torneosRepo.save(
    torneosRepo.create({
      nombre: 'Copa IPVG Rocket League 2026',
      videojuego: 'Rocket League',
      modalidad: Modalidad.LIGA,
      descripcion: 'Liga 3v3 todos contra todos. Victoria 3 pts, empate 1 pt.',
      fechaInicio: '2026-11-16',
      cierreInscripcion: new Date('2026-11-13T23:59:00'),
      cupoMaximo: 4,
      estado: EstadoTorneo.EN_CURSO,
    }),
  );
  const t2 = await torneosRepo.save(
    torneosRepo.create({
      nombre: 'Torneo Valorant Primavera IPVG',
      videojuego: 'Valorant',
      modalidad: Modalidad.ELIMINACION,
      descripcion: 'Eliminación directa 5v5, partidas al mejor de 3. No hay empates.',
      fechaInicio: '2026-12-07',
      cierreInscripcion: new Date('2026-12-04T23:59:00'),
      cupoMaximo: 4,
      estado: EstadoTorneo.ABIERTO,
    }),
  );
  const t3 = await torneosRepo.save(
    torneosRepo.create({
      nombre: 'Liga EA Sports FC Sede Chillán',
      videojuego: 'EA Sports FC 25',
      modalidad: Modalidad.LIGA,
      descripcion: 'Liga 1v1 por equipos. Torneo ya finalizado.',
      fechaInicio: '2026-10-05',
      cierreInscripcion: new Date('2026-10-02T23:59:00'),
      cupoMaximo: 3,
      estado: EstadoTorneo.FINALIZADO,
    }),
  );
  await torneosRepo.save(
    torneosRepo.create({
      nombre: 'Clásico Smash IPVG',
      videojuego: 'Super Smash Bros. Ultimate',
      modalidad: Modalidad.ELIMINACION,
      descripcion: 'Torneo recién abierto, aún sin equipos inscritos.',
      fechaInicio: '2026-12-14',
      cierreInscripcion: new Date('2026-12-11T23:59:00'),
      cupoMaximo: 8,
      estado: EstadoTorneo.ABIERTO,
    }),
  );

  // ---------- Inscripciones ----------
  const inscribir = (torneo: Torneo, equipo: Equipo, estado: EstadoInscripcion) =>
    inscRepo.save(inscRepo.create({ torneoId: torneo.id, equipoId: equipo.id, estado }));
  for (const e of [nuble, chillanejos, bandits, cordillera]) await inscribir(t1, e, EstadoInscripcion.ACEPTADA);
  await inscribir(t2, itata, EstadoInscripcion.ACEPTADA);
  await inscribir(t2, legends, EstadoInscripcion.ACEPTADA);
  await inscribir(t2, nuble, EstadoInscripcion.PENDIENTE);
  for (const e of [cordillera, chillanejos, legends]) await inscribir(t3, e, EstadoInscripcion.ACEPTADA);

  // ---------- Partidos y resultados ----------
  const partido = async (
    torneo: Torneo, local: Equipo, visita: Equipo, fecha: string, ronda: string,
    marcador?: [number, number],
  ) => {
    const p = await partidosRepo.save(
      partidosRepo.create({
        torneoId: torneo.id,
        equipoLocalId: local.id,
        equipoVisitanteId: visita.id,
        fechaHora: new Date(fecha),
        ronda,
        estado: marcador ? EstadoPartido.FINALIZADO : EstadoPartido.PROGRAMADO,
      }),
    );
    if (marcador) {
      const [pl, pv] = marcador;
      await resultadosRepo.save(
        resultadosRepo.create({
          partidoId: p.id,
          puntajeLocal: pl,
          puntajeVisitante: pv,
          ganadorId: pl > pv ? local.id : pv > pl ? visita.id : null,
          registradoPorId: admin.id,
        }),
      );
    }
  };

  // Torneo 1 (liga en curso): 4 jugados, 2 por jugar
  await partido(t1, nuble, chillanejos, '2026-11-17T18:00:00', 'Fecha 1', [3, 1]);
  await partido(t1, bandits, cordillera, '2026-11-17T19:30:00', 'Fecha 1', [2, 2]);
  await partido(t1, nuble, bandits, '2026-11-20T18:00:00', 'Fecha 2', [1, 1]);
  await partido(t1, chillanejos, cordillera, '2026-11-20T19:30:00', 'Fecha 2', [4, 2]);
  await partido(t1, nuble, cordillera, '2026-11-27T18:00:00', 'Fecha 3');
  await partido(t1, chillanejos, bandits, '2026-11-27T19:30:00', 'Fecha 3');

  // Torneo 2 (eliminación, inscripciones abiertas)
  await partido(t2, itata, legends, '2026-12-07T18:00:00', 'Semifinal 1');

  // Torneo 3 (finalizado)
  await partido(t3, cordillera, chillanejos, '2026-10-06T17:00:00', 'Fecha 1', [2, 0]);
  await partido(t3, chillanejos, legends, '2026-10-08T17:00:00', 'Fecha 2', [1, 1]);
  await partido(t3, legends, cordillera, '2026-10-10T17:00:00', 'Fecha 3', [0, 3]);

  console.log('> Datos de prueba cargados:');
  console.log(`  usuarios: ${await usuariosRepo.count()}, equipos: ${await equiposRepo.count()}, ` +
    `torneos: ${await torneosRepo.count()}, inscripciones: ${await inscRepo.count()}, ` +
    `partidos: ${await partidosRepo.count()}, resultados: ${await resultadosRepo.count()}`);
  console.log('  ADMIN: admin@ipvg.cl / Admin123!   ESTUDIANTE: estudiante1@ipvg.cl / Estudiante123!');
  await app.close();
}

seed().catch((err) => {
  console.error('Error al cargar los datos de prueba:', err);
  process.exit(1);
});
