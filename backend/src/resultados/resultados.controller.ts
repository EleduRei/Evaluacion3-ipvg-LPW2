import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResultadosService } from './resultados.service';
import { RegistrarResultadoDto } from './dto/registrar-resultado.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsuarioActual, UsuarioToken } from '../auth/decorators/usuario-actual.decorator';
import { Rol } from '../common/enums';

// Recurso anidado: el resultado pertenece a un partido
@ApiTags('Resultados')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('partidos/:partidoId/resultado')
export class ResultadosController {
  constructor(private readonly resultadosService: ResultadosService) {}

  @Get()
  @ApiOperation({ summary: 'Ver el resultado oficial de un partido' })
  obtener(@Param('partidoId', ParseIntPipe) partidoId: number) {
    return this.resultadosService.obtenerPorPartido(partidoId);
  }

  @Post()
  @Roles(Rol.ADMIN)
  @ApiOperation({ summary: 'Registrar resultado oficial (solo ADMIN); el ganador se calcula solo' })
  @ApiResponse({ status: 404, description: 'El partido no existe' })
  @ApiResponse({ status: 409, description: 'El partido ya tiene resultado' })
  registrar(
    @Param('partidoId', ParseIntPipe) partidoId: number,
    @Body() dto: RegistrarResultadoDto,
    @UsuarioActual() usuario: UsuarioToken,
  ) {
    return this.resultadosService.registrar(partidoId, dto, usuario);
  }

  @Put()
  @Roles(Rol.ADMIN)
  @ApiOperation({ summary: 'Corregir resultado oficial (solo ADMIN)' })
  corregir(
    @Param('partidoId', ParseIntPipe) partidoId: number,
    @Body() dto: RegistrarResultadoDto,
    @UsuarioActual() usuario: UsuarioToken,
  ) {
    return this.resultadosService.corregir(partidoId, dto, usuario);
  }

  @Delete()
  @Roles(Rol.ADMIN)
  @ApiOperation({ summary: 'Anular resultado; el partido vuelve a PROGRAMADO (solo ADMIN)' })
  anular(@Param('partidoId', ParseIntPipe) partidoId: number) {
    return this.resultadosService.anular(partidoId);
  }
}
