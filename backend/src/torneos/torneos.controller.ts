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
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TorneosService } from './torneos.service';
import { CrearTorneoDto } from './dto/crear-torneo.dto';
import { ActualizarTorneoDto } from './dto/actualizar-torneo.dto';
import { FiltroTorneosDto } from './dto/filtro-torneos.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Rol } from '../common/enums';

@ApiTags('Torneos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('torneos')
export class TorneosController {
  constructor(private readonly torneosService: TorneosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar torneos con búsqueda y filtros combinables' })
  listar(@Query() filtros: FiltroTorneosDto) {
    return this.torneosService.listar(filtros);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de un torneo con sus inscripciones' })
  @ApiResponse({ status: 404, description: 'El torneo no existe' })
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.torneosService.obtener(id);
  }

  @Get(':id/ranking')
  @ApiOperation({ summary: 'Tabla de posiciones calculada desde los resultados oficiales' })
  ranking(@Param('id', ParseIntPipe) id: number) {
    return this.torneosService.ranking(id);
  }

  @Post()
  @Roles(Rol.ADMIN)
  @ApiOperation({ summary: 'Crear torneo (solo ADMIN)' })
  @ApiResponse({ status: 403, description: 'El usuario no es administrador' })
  crear(@Body() dto: CrearTorneoDto) {
    return this.torneosService.crear(dto);
  }

  @Patch(':id')
  @Roles(Rol.ADMIN)
  @ApiOperation({ summary: 'Editar torneo (solo ADMIN)' })
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: ActualizarTorneoDto) {
    return this.torneosService.actualizar(id, dto);
  }

  @Delete(':id')
  @Roles(Rol.ADMIN)
  @ApiOperation({ summary: 'Eliminar torneo con sus inscripciones y partidos (solo ADMIN)' })
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.torneosService.eliminar(id);
  }
}
