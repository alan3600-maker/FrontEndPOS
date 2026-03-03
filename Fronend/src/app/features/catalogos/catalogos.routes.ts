import { Routes } from '@angular/router';

export const CATALOGOS_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'categorias',
  },
  {
    path: 'categorias',
    loadComponent: () =>
      import('./pages/categorias/categorias.component').then((m) => m.CategoriasComponent),
  },
  {
    path: 'marcas',
    loadComponent: () =>
      import('./pages/marcas/marcas.component').then((m) => m.MarcasComponent),
  },
  {
    path: 'proveedores',
    loadComponent: () =>
      import('./pages/proveedores/proveedores.component').then((m) => m.ProveedoresComponent),
  },
];
