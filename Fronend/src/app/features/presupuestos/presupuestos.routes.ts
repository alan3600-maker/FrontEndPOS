import { Routes } from '@angular/router';

export const PRESUPUESTOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/presupuestos/presupuestos.component').then((m) => m.PresupuestosComponent),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./pages/nuevo-presupuesto/nuevo-presupuesto.component').then(
        (m) => m.NuevoPresupuestoComponent,
      ),
  },
];
