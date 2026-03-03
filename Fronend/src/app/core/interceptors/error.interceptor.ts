import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

function getMsg(err: HttpErrorResponse): string {
  const e = err.error;

  // backend tipo { message: "..." }
  if (e && typeof e === 'object' && 'message' in e && typeof (e as any).message === 'string') {
    return (e as any).message;
  }

  // backend string plano
  if (typeof e === 'string' && e.trim()) return e;

  if (err.status === 0) return 'No se pudo conectar al servidor.';
  if (err.status === 401) return 'Sesión expirada o credenciales inválidas.';
  if (err.status === 403) return 'No tenés permisos para esta acción.';
  if (err.status === 404) return 'Recurso no encontrado.';
  if (err.status >= 500) return 'Error interno del servidor.';
  return err.message || 'Ocurrió un error.';
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snack = inject(MatSnackBar);
  const router = inject(Router);
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const msg = getMsg(err);

      // ⛔ No mostrar snackbar duplicado en login (opcional)
      const isLoginCall = req.url.includes('/api/auth/login');

      // 401: sesión expirada / token inválido
      if (err.status === 401 && !isLoginCall) {
        auth.logout();

        // si ya está en /login, no hace falta navegar
        if (router.url !== '/login') {
          router.navigateByUrl('/login');
        }
      }

      // 403: sin permisos
      if (err.status === 403) {
        if (!router.url.startsWith('/forbidden')) {
          router.navigateByUrl('/forbidden');
        }
      }

      // Snackbar (lo mostramos igual, pero podés evitarlo en 401 si querés)
      // Si preferís NO mostrar snack en 401 porque ya redirige:
      // if (err.status !== 401 || isLoginCall) { ... }
      if (!(err.status === 401 && !isLoginCall)) {
        snack.open(msg, 'Cerrar', {
          duration: 4500,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['snackbar-error'],
        });
      }

      return throwError(() => err);
    })
  );
};
