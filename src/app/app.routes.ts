import { Routes } from '@angular/router';
import { LoginComponent } from './core/auth/login.component';
import { ShellComponent } from './layout/shell.component';
import { authGuard } from './core/guards/auth.guard';
import { accessGuard } from './core/guards/access.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },

  {
    path: 'forbidden',
    loadComponent: () =>
      import('./core/pages/forbidden/forbidden.component').then((m) => m.ForbiddenComponent),
  },

  // 403 (top-level)
  {
    path: 'forbidden',
    loadComponent: () =>
      import('./core/pages/forbidden/forbidden.component').then((m) => m.ForbiddenComponent),
  },

  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],

    children: [
      {
        path: '',
        loadComponent: () => import('./layout/home.component').then((m) => m.HomeComponent),
      },

      {
        path: 'clientes',
        loadComponent: () =>
          import('./features/clientes/pages/clientes/clientes.component').then(
            (m) => m.ClientesComponent
          ),
        canActivate: [accessGuard],
        data: { permisos: ['CLIENTE_CRUD'] },
      },

      {
        path: 'productos',
        loadComponent: () =>
          import('./features/productos/pages/productos/productos.component').then(
            (m) => m.ProductosComponent
          ),
        canActivate: [accessGuard],
        data: { permisos: ['PRODUCTO_CRUD'] },
      },
      {
        path: 'ventas/nueva',
        loadComponent: () =>
          import('./features/ventas/pages/nueva-venta/nueva-venta.component').then(
            (m) => m.NuevaVentaComponent
          ),
        canActivate: [accessGuard],
        data: { permisos: ['VENTA_CRUD'] },
      },
      {
        path: 'stock/entrada',
        loadComponent: () =>
          import('./features/stock/pages/stock-entrada/stock-entrada.component').then(
            (m) => m.StockEntradaComponent
          ),
        canActivate: [accessGuard],
        data: { permisos: ['STOCK_MOVIMIENTO'] },
      },
    ],
  },

  { path: '**', redirectTo: '' },
];
