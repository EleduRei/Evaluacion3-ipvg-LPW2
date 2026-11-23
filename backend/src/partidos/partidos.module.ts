import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Partido } from './partido.entity';
import { Torneo } from '../torneos/torneo.entity';
import { Inscripcion } from '../inscripciones/inscripcion.entity';
import { PartidosService } from './partidos.service';
import { PartidosController } from './partidos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Partido, Torneo, Inscripcion])],
  controllers: [PartidosController],
  providers: [PartidosService],
})
export class PartidosModule {}
