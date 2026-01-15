import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../core/auth/auth.service';
import { HasPermisoDirective } from '../core/auth/has-permiso.directive';

@Component({
  standalone: true,
  selector: 'app-shell',
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatButtonModule,
    HasPermisoDirective
  ],
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
})
export class ShellComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  get username() {
    return this.auth.auth()?.username ?? '';
  }

  canClientes() {
    return this.auth.hasPermiso('CLIENTE_CRUD') || this.auth.hasRole('ADMIN');
  }

  canProductos() {
    return this.auth.hasPermiso('PRODUCTO_CRUD') || this.auth.hasRole('ADMIN');
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
