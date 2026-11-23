import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class AgregarIntegranteDto {
  @ApiProperty({ example: 3, description: 'id del usuario a agregar' })
  @IsInt({ message: 'usuarioId debe ser un número entero' })
  @IsPositive()
  usuarioId: number;
}
