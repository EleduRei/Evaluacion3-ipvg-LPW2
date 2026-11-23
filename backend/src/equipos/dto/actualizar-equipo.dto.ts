import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CrearEquipoDto } from './crear-equipo.dto';
import { EstadoEquipo } from '../../common/enums';

// PartialType: todos los campos de CrearEquipoDto pasan a ser opcionales
export class ActualizarEquipoDto extends PartialType(CrearEquipoDto) {
  @ApiPropertyOptional({ enum: EstadoEquipo })
  @IsOptional()
  @IsEnum(EstadoEquipo, { message: 'Estado de equipo no válido' })
  estado?: EstadoEquipo;
}
