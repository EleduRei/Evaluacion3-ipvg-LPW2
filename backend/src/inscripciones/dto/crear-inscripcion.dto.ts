import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class CrearInscripcionDto {
  @ApiProperty({ example: 1 })
  @IsInt({ message: 'torneoId debe ser un número entero' })
  @IsPositive()
  torneoId: number;

  @ApiProperty({ example: 2 })
  @IsInt({ message: 'equipoId debe ser un número entero' })
  @IsPositive()
  equipoId: number;
}
