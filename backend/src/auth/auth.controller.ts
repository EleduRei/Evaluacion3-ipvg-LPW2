import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registro')
  @ApiOperation({ summary: 'Registrar un estudiante (público)' })
  @ApiResponse({ status: 201, description: 'Usuario creado; devuelve token y datos' })
  @ApiResponse({ status: 409, description: 'Correo o alias ya registrados' })
  registro(@Body() dto: RegistroDto) {
    return this.authService.registro(dto);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Iniciar sesión con correo y contraseña (público)' })
  @ApiResponse({ status: 200, description: 'Devuelve access_token (JWT) y datos del usuario' })
  @ApiResponse({ status: 401, description: 'Credenciales incorrectas' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
