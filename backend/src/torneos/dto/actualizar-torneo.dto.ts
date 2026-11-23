import { PartialType } from '@nestjs/swagger';
import { CrearTorneoDto } from './crear-torneo.dto';

// Todos los campos de creación, pero opcionales (PATCH)
export class ActualizarTorneoDto extends PartialType(CrearTorneoDto) {}
