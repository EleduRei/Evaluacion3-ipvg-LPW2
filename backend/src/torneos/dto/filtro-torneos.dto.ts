import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EstadoTorneo, Modalidad } from '../../common/enums';

/** Filtros combinables que llegan por query string: /torneos?q=copa&estado=ABIERTO */
export class FiltroTorneosDto {
  @ApiPropertyOptional({ description: 'Texto a buscar en nombre o videojuego' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ example: 'Valorant' })
  @IsOptional()
  @IsString()
  videojuego?: string;

  @ApiPropertyOptional({ enum: EstadoTorneo })
  @IsOptional()
  @IsEnum(EstadoTorneo)
  estado?: EstadoTorneo;

  @ApiPropertyOptional({ enum: Modalidad })
  @IsOptional()
  @IsEnum(Modalidad)
  modalidad?: Modalidad;
}
