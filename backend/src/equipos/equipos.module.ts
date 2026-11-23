import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Equipo } from './equipo.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { Partido } from '../partidos/partido.entity';
import { EquiposService } from './equipos.service';
import { EquiposController } from './equipos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Equipo, Usuario, Partido])],
  controllers: [EquiposController],
  providers: [EquiposService],
})
export class EquiposModule {}
