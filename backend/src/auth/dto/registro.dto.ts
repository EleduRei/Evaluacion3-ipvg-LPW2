import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegistroDto {
  @ApiProperty({ example: 'Camila Rojas' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(100)
  nombre: string;

  @ApiProperty({ example: 'camiGG', description: 'Nombre visible en los torneos (único)' })
  @IsString()
  @MinLength(3, { message: 'El alias debe tener al menos 3 caracteres' })
  @MaxLength(40)
  @Matches(/^[A-Za-z0-9_.-]+$/, { message: 'El alias solo admite letras, números, punto, guion y guion bajo' })
  alias: string;

  @ApiProperty({ example: 'camila.rojas@ipvg.cl' })
  @IsEmail({}, { message: 'El correo no tiene un formato válido' })
  @MaxLength(120)
  correo: string;

  @ApiProperty({ example: 'Clave123!', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @MaxLength(60)
  password: string;
}
