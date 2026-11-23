import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

/**
 * Solo se ingresan los puntajes. El ganador (o empate) lo calcula el servidor,
 * así el resultado siempre es coherente con el marcador.
 */
export class RegistrarResultadoDto {
  @ApiProperty({ example: 3, minimum: 0 })
  @IsInt({ message: 'El puntaje local debe ser un número entero' })
  @Min(0, { message: 'El puntaje no puede ser negativo' })
  @Max(999)
  puntajeLocal: number;

  @ApiProperty({ example: 1, minimum: 0 })
  @IsInt({ message: 'El puntaje visitante debe ser un número entero' })
  @Min(0, { message: 'El puntaje no puede ser negativo' })
  @Max(999)
  puntajeVisitante: number;
}
