import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EquiposService } from './equipos.service';
import { CrearEquipoDto } from './dto/crear-equipo.dto';
import { ActualizarEquipoDto } from './dto/actualizar-equipo.dto';
import { AgregarIntegranteDto } from './dto/agregar-integrante.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UsuarioActual, UsuarioToken } from '../auth/decorators/usuario-actual.decorator';

@ApiTags('Equipos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('equipos')
export class EquiposController {
  constructor(private readonly equiposService: EquiposService) {}

  @Get()
  @ApiOperation({ summary: 'Listar equipos con capitán e integrantes' })
  listar() {
    return this.equiposService.listar();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de un equipo' })
  @ApiResponse({ status: 404, description: 'El equipo no existe' })
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.equiposService.obtener(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear equipo (quien lo crea queda como capitán)' })
  crear(@Body() dto: CrearEquipoDto, @UsuarioActual() usuario: UsuarioToken) {
    return this.equiposService.crear(dto, usuario);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar equipo (capitán o ADMIN)' })
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarEquipoDto,
    @UsuarioActual() usuario: UsuarioToken,
  ) {
    return this.equiposService.actualizar(id, dto, usuario);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar equipo sin partidos (capitán o ADMIN)' })
  eliminar(@Param('id', ParseIntPipe) id: number, @UsuarioActual() usuario: UsuarioToken) {
    return this.equiposService.eliminar(id, usuario);
  }

  @Post(':id/integrantes')
  @ApiOperation({ summary: 'Agregar integrante (capitán o ADMIN)' })
  agregarIntegrante(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AgregarIntegranteDto,
    @UsuarioActual() usuario: UsuarioToken,
  ) {
    return this.equiposService.agregarIntegrante(id, dto.usuarioId, usuario);
  }

  @Delete(':id/integrantes/:usuarioId')
  @ApiOperation({ summary: 'Quitar integrante (capitán o ADMIN)' })
  quitarIntegrante(
    @Param('id', ParseIntPipe) id: number,
    @Param('usuarioId', ParseIntPipe) usuarioId: number,
    @UsuarioActual() usuario: UsuarioToken,
  ) {
    return this.equiposService.quitarIntegrante(id, usuarioId, usuario);
  }
}
