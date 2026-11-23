import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsPositive, IsString, MaxLength } from 'class-validator';

export class CrearPartidoDto {
  @ApiProperty({ example: 1 })
  @IsInt({ message: 'torneoId debe ser un número entero' })
  @IsPositive()
  torneoId: number;

  @ApiProperty({ example: 1 })
  @IsInt({ message: 'equipoLocalId debe ser un número entero' })
  @IsPositive()
  equipoLocalId: number;

  @ApiProperty({ example: 2 })
  @IsInt({ message: 'equipoVisitanteId debe ser un número entero' })
  @IsPositive()
  equipoVisitanteId: number;

  @ApiProperty({ example: '2026-12-10T18:00' })
  @IsDateString({}, { message: 'fechaHora debe ser una fecha y hora válida' })
  fechaHora: string;

  @ApiProperty({ example: 'Fecha 1' })
  @IsString()
  @IsNotEmpty({ message: 'La ronda es obligatoria' })
  @MaxLength(40)
  ronda: string;
}
