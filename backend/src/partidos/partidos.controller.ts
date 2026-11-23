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
import { PartidosService } from './partidos.service';
import { CrearPartidoDto } from './dto/crear-partido.dto';
import { ActualizarPartidoDto } from './dto/actualizar-partido.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { EstadoPartido, Rol } from '../common/enums';

@ApiTags('Partidos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('partidos')
export class PartidosController {
  constructor(private readonly partidosService: PartidosService) {}

  @Get()
  @ApiQuery({ name: 'torneoId', required: false, type: Number })
  @ApiQuery({ name: 'estado', required: false, enum: EstadoPartido })
  @ApiOperation({ summary: 'Listar partidos (calendario), filtrable por torneo y estado' })
  listar(@Query('torneoId') torneoId?: string, @Query('estado') estado?: EstadoPartido) {
    return this.partidosService.listar(torneoId ? Number(torneoId) : undefined, estado);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de un partido con su resultado' })
  @ApiResponse({ status: 404, description: 'El partido no existe' })
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.partidosService.obtener(id);
  }

  @Post()
  @Roles(Rol.ADMIN)
  @ApiOperation({ summary: 'Programar partido entre equipos inscritos (solo ADMIN)' })
  @ApiResponse({ status: 400, description: 'Equipos iguales o no inscritos en el torneo' })
  crear(@Body() dto: CrearPartidoDto) {
    return this.partidosService.crear(dto);
  }

  @Patch(':id')
  @Roles(Rol.ADMIN)
  @ApiOperation({ summary: 'Reprogramar o cancelar partido (solo ADMIN)' })
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: ActualizarPartidoDto) {
    return this.partidosService.actualizar(id, dto);
  }

  @Delete(':id')
  @Roles(Rol.ADMIN)
  @ApiOperation({ summary: 'Eliminar partido (solo ADMIN)' })
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.partidosService.eliminar(id);
  }
}
