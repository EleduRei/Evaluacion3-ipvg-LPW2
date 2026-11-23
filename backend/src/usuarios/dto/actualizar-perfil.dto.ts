import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class ActualizarPerfilDto {
  @ApiPropertyOptional({ example: 'Camila Rojas Soto' })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'El nombre no puede quedar vacío' })
  @MaxLength(100)
  nombre?: string;

  @ApiPropertyOptional({ example: 'camiPro' })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'El alias debe tener al menos 3 caracteres' })
  @MaxLength(40)
  @Matches(/^[A-Za-z0-9_.-]+$/, { message: 'El alias solo admite letras, números, punto, guion y guion bajo' })
  alias?: string;

  @ApiPropertyOptional({ example: 'NuevaClave123', description: 'Solo si desea cambiarla' })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @MaxLength(60)
  password?: string;
}
