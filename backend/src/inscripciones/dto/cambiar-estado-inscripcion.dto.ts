import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { EstadoInscripcion } from '../../common/enums';

export class CambiarEstadoInscripcionDto {
  @ApiProperty({ enum: EstadoInscripcion, example: EstadoInscripcion.ACEPTADA })
  @IsEnum(EstadoInscripcion, { message: 'El estado debe ser PENDIENTE, ACEPTADA o RECHAZADA' })
  estado: EstadoInscripcion;
}
