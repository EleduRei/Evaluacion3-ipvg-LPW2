import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resultado } from './resultado.entity';
import { Partido } from '../partidos/partido.entity';
import { ResultadosService } from './resultados.service';
import { ResultadosController } from './resultados.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Resultado, Partido])],
  controllers: [ResultadosController],
  providers: [ResultadosService],
})
export class ResultadosModule {}
