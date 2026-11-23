import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CrearEquipoDto {
  @ApiProperty({ example: 'Ñuble Esports' })
  @IsString()
  @MinLength(3, { message: 'El nombre del equipo debe tener al menos 3 caracteres' })
  @MaxLength(80)
  nombre: string;

  @ApiProperty({ example: 'Valorant' })
  @IsString()
  @IsNotEmpty({ message: 'El juego preferido es obligatorio' })
  @MaxLength(80)
  juegoPreferido: string;
}
