import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

/**
 * Guard de autenticación.
 * 1. Lee el header "Authorization: Bearer <token>".
 * 2. Verifica la firma y la expiración del token con JWT_SECRET.
 * 3. Deja el payload en request.user para los guards/controllers siguientes.
 * Si algo falla responde 401 Unauthorized.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const [tipo, token] = (request.headers.authorization ?? '').split(' ');

    if (tipo !== 'Bearer' || !token) {
      throw new UnauthorizedException('Debe iniciar sesión (no se envió el token)');
    }

    try {
      request.user = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('Token inválido o expirado, inicie sesión nuevamente');
    }
    return true;
  }
}
