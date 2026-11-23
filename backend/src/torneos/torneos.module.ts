import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Torneo } from './torneo.entity';
import { Inscripcion } from '../inscripciones/inscripcion.entity';
import { Partido } from '../partidos/partido.entity';
import { TorneosService } from './torneos.service';
import { TorneosController } from './torneos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Torneo, Inscripcion, Partido])],
  controllers: [TorneosController],
  providers: [TorneosService],
})
export class TorneosModule {}
