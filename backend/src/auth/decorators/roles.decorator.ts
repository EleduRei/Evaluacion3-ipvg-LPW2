import { SetMetadata } from '@nestjs/common';
import { Rol } from '../../common/enums';

export const ROLES_KEY = 'roles';

/**
 * Marca un endpoint con los roles que pueden ejecutarlo.
 * Ejemplo: @Roles(Rol.ADMIN)
 * El RolesGuard lee esta metadata y compara con el rol del token.
 */
export const Roles = (...roles: Rol[]) => SetMetadata(ROLES_KEY, roles);
