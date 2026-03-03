import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Si el token está vacío o no existe → login
  if (!auth.isLoggedIn()) {
    return router.parseUrl('/login');
  }

  return true;
};

