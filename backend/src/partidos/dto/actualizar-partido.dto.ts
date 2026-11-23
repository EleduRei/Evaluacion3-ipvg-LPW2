import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { EstadoPartido } from '../../common/enums';

/** Reprogramar o cancelar un partido. Los equipos no se cambian: se elimina y se crea otro. */
export class ActualizarPartidoDto {
  @ApiPropertyOptional({ example: '2026-12-11T19:00' })
  @IsOptional()
  @IsDateString({}, { message: 'fechaHora debe ser una fecha y hora válida' })
  fechaHora?: string;

  @ApiPropertyOptional({ example: 'Semifinal' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  ronda?: string;

  @ApiPropertyOptional({ enum: [EstadoPartido.PROGRAMADO, EstadoPartido.CANCELADO] })
  @IsOptional()
  @IsEnum(EstadoPartido)
  estado?: EstadoPartido;
}
