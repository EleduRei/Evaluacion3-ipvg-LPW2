import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inscripcion } from './inscripcion.entity';
import { Torneo } from '../torneos/torneo.entity';
import { Equipo } from '../equipos/equipo.entity';
import { Partido } from '../partidos/partido.entity';
import { InscripcionesService } from './inscripciones.service';
import { InscripcionesController } from './inscripciones.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Inscripcion, Torneo, Equipo, Partido])],
  controllers: [InscripcionesController],
  providers: [InscripcionesService],
})
export class InscripcionesModule {}
