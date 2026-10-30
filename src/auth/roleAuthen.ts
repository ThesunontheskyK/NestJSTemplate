import { Injectable, CanActivate, ExecutionContext, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppError } from '../middleware/AppError';

import { Role } from './role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (roles: Role[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
      
      
    const { user } = context.switchToHttp().getRequest();
    
    if (!user || !user.roleName) {
      throw new AppError('Forbidden: No role assigned', 403);
    }
    const hasRole = requiredRoles.some((role) => user.roleName === role);

    if (!hasRole) {
      throw new AppError('Forbidden: You do not have permission to access this resource', 403);
    }

    return true;
  }
}
