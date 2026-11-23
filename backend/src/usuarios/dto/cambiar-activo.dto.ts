import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class CambiarActivoDto {
  @ApiProperty({ example: false })
  @IsBoolean({ message: 'activo debe ser true o false' })
  activo: boolean;
}
