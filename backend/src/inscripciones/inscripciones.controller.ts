import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InscripcionesService } from './inscripciones.service';
import { CrearInscripcionDto } from './dto/crear-inscripcion.dto';
import { CambiarEstadoInscripcionDto } from './dto/cambiar-estado-inscripcion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsuarioActual, UsuarioToken } from '../auth/decorators/usuario-actual.decorator';
import { Rol } from '../common/enums';

@ApiTags('Inscripciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inscripciones')
export class InscripcionesController {
  constructor(private readonly inscripcionesService: InscripcionesService) {}

  @Get()
  @ApiQuery({ name: 'torneoId', required: false, type: Number })
  @ApiOperation({ summary: 'Listar inscripciones (opcionalmente de un torneo)' })
  listar(@Query('torneoId') torneoId?: string) {
    return this.inscripcionesService.listar(torneoId ? Number(torneoId) : undefined);
  }

  @Post()
  @ApiOperation({ summary: 'Inscribir un equipo en un torneo (capitán o ADMIN)' })
  @ApiResponse({ status: 400, description: 'Inscripción cerrada' })
  @ApiResponse({ status: 409, description: 'Inscripción duplicada o cupo completo' })
  crear(@Body() dto: CrearInscripcionDto, @UsuarioActual() usuario: UsuarioToken) {
    return this.inscripcionesService.crear(dto, usuario);
  }

  @Patch(':id/estado')
  @Roles(Rol.ADMIN)
  @ApiOperation({ summary: 'Aceptar o rechazar una inscripción (solo ADMIN)' })
  cambiarEstado(@Param('id', ParseIntPipe) id: number, @Body() dto: CambiarEstadoInscripcionDto) {
    return this.inscripcionesService.cambiarEstado(id, dto.estado);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Retirar inscripción (capitán o ADMIN)' })
  eliminar(@Param('id', ParseIntPipe) id: number, @UsuarioActual() usuario: UsuarioToken) {
    return this.inscripcionesService.eliminar(id, usuario);
  }
}
