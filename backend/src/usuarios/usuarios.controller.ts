import { Body, Controller, Get, Param, ParseIntPipe, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsuariosService } from './usuarios.service';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto';
import { CambiarActivoDto } from './dto/cambiar-activo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsuarioActual, UsuarioToken } from '../auth/decorators/usuario-actual.decorator';
import { Rol } from '../common/enums';

@ApiTags('Usuarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get('perfil')
  @ApiOperation({ summary: 'Perfil del usuario autenticado' })
  perfil(@UsuarioActual() usuario: UsuarioToken) {
    return this.usuariosService.obtenerPerfil(usuario.sub);
  }

  @Patch('perfil')
  @ApiOperation({ summary: 'Actualizar nombre, alias o contraseña propios' })
  actualizarPerfil(@UsuarioActual() usuario: UsuarioToken, @Body() dto: ActualizarPerfilDto) {
    return this.usuariosService.actualizarPerfil(usuario.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listado básico de usuarios (para agregar integrantes)' })
  listar() {
    return this.usuariosService.listar();
  }

  @Patch(':id/activo')
  @Roles(Rol.ADMIN)
  @ApiOperation({ summary: 'Activar o desactivar un usuario (solo ADMIN)' })
  cambiarActivo(@Param('id', ParseIntPipe) id: number, @Body() dto: CambiarActivoDto) {
    return this.usuariosService.cambiarActivo(id, dto.activo);
  }
}
