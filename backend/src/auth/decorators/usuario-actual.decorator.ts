import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Rol } from '../../common/enums';

/** Datos que viajan dentro del token JWT (payload). */
export interface UsuarioToken {
  sub: number; // id del usuario
  correo: string;
  alias: string;
  rol: Rol;
}

/**
 * Permite recibir en el controller el usuario autenticado:
 *   crear(@UsuarioActual() usuario: UsuarioToken)
 * El JwtAuthGuard deja el payload del token en request.user.
 */
export const UsuarioActual = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UsuarioToken => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
