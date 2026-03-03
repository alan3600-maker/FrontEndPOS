import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Si ya está logueado, no tiene sentido volver a /login
  return auth.isLoggedIn() ? router.parseUrl('/') : true;
};
