import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  selector: 'app-forbidden',
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="wrap">
      <mat-card class="card">
        <mat-card-content>
          <div class="icon">
            <mat-icon aria-hidden="true">lock</mat-icon>
          </div>

          <h2>403 - Acceso denegado</h2>
          <p>No tenés permisos para acceder a esta pantalla.</p>

          <div class="actions">
            <button mat-raised-button color="primary" routerLink="/">Volver al inicio</button>
            <button mat-button routerLink="/login">Ir al login</button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .wrap {
        height: calc(100vh - 64px);
        display: grid;
        place-items: center;
        padding: 16px;
      }
      .card {
        max-width: 440px;
        width: 100%;
        padding: 8px;
      }
      .icon {
        display: grid;
        place-items: center;
        margin-bottom: 12px;
      }
      mat-icon {
        font-size: 52px;
        width: 52px;
        height: 52px;
      }
      h2 {
        margin: 0 0 8px 0;
      }
      p {
        margin: 0 0 16px 0;
        opacity: 0.85;
      }
      .actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
    `,
  ],
})
export class ForbiddenComponent {}
