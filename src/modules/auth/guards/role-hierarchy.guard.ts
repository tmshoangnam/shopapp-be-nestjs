import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RoleHierarchyGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  // Define role hierarchy (higher index = higher privilege)
  private readonly roleHierarchy: Role[] = [
    Role.USER,
    Role.STAFF,
    Role.ADMIN,
    Role.SUPER_ADMIN,
  ];

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const userRoleLevel = this.roleHierarchy.indexOf(user.role);
    const requiredRoleLevel = Math.min(
      ...requiredRoles.map(role => this.roleHierarchy.indexOf(role))
    );

    if (userRoleLevel < requiredRoleLevel) {
      throw new ForbiddenException(
        `Access denied. Required minimum role level: ${this.roleHierarchy[requiredRoleLevel]}. Your role: ${user.role}`
      );
    }

    return true;
  }
}

