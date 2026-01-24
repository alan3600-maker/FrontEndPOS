import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../core/auth/auth.service';
import { HasPermisoDirective } from '../core/auth/has-permiso.directive';
import { PosContextService } from '../core/pos/pos-context.service';
import { PosSettingsDialogComponent } from './pos-settings-dialog/pos-settings-dialog.component';

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
    MatIconModule,
    MatDialogModule,
    HasPermisoDirective
  ],
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
})
export class ShellComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  readonly pos = inject(PosContextService);

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

  openPosSettings() {
    this.dialog.open(PosSettingsDialogComponent, {
      width: '360px',
    });
  }
}
