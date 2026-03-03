import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const accessGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) return router.parseUrl('/login');

  const roles: string[] = (route.data?.['roles'] as string[]) ?? [];
  const permisos: string[] = (route.data?.['permisos'] as string[]) ?? [];

  const okRoles = auth.hasRole(...roles);
  const okPermisos = auth.hasPermiso(...permisos);

  return okRoles && okPermisos ? true : router.parseUrl('/forbidden');
};