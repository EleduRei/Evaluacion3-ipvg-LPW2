import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@ipvg.cl' })
  @IsEmail({}, { message: 'El correo no tiene un formato válido' })
  correo: string;

  @ApiProperty({ example: 'Admin123!' })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;
}
