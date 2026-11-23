import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { EstadoTorneo, Modalidad } from '../../common/enums';

export class CrearTorneoDto {
  @ApiProperty({ example: 'Copa IPVG Valorant 2026' })
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(100)
  nombre: string;

  @ApiProperty({ example: 'Valorant' })
  @IsString()
  @IsNotEmpty({ message: 'El videojuego es obligatorio' })
  @MaxLength(80)
  videojuego: string;

  @ApiProperty({ enum: Modalidad, example: Modalidad.LIGA })
  @IsEnum(Modalidad, { message: 'La modalidad debe ser LIGA o ELIMINACION' })
  modalidad: Modalidad;

  @ApiPropertyOptional({ example: 'Torneo 5v5, partidas al mejor de 3.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  descripcion?: string;

  @ApiProperty({ example: '2026-12-10', description: 'Fecha de inicio (YYYY-MM-DD)' })
  @IsDateString({}, { message: 'fechaInicio debe ser una fecha válida' })
  fechaInicio: string;

  @ApiProperty({ example: '2026-12-05T23:59', description: 'Fecha y hora de cierre de inscripciones' })
  @IsDateString({}, { message: 'cierreInscripcion debe ser una fecha válida' })
  cierreInscripcion: string;

  @ApiProperty({ example: 8, minimum: 2, maximum: 64 })
  @IsInt({ message: 'El cupo máximo debe ser un número entero' })
  @Min(2, { message: 'El cupo mínimo es de 2 equipos' })
  @Max(64, { message: 'El cupo máximo permitido es 64 equipos' })
  cupoMaximo: number;

  @ApiPropertyOptional({ enum: EstadoTorneo, default: EstadoTorneo.ABIERTO })
  @IsOptional()
  @IsEnum(EstadoTorneo, { message: 'Estado de torneo no válido' })
  estado?: EstadoTorneo;
}
