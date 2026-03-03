import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from './auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCardModule,
  ],
  template: `
    <div class="wrap">
      <mat-card class="card login-card">
        <div class="login-logo">
          <img src="/logo-virgen-caacupe.svg" alt="Virgen de Caacupé" />
        </div>

        <mat-card-title>Ingresar</mat-card-title>
        <mat-card-subtitle>Hidráulica Nuestra Sra. De Caacupe</mat-card-subtitle>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline" class="full">
            <mat-label>Usuario</mat-label>
            <input matInput formControlName="username" autocomplete="username" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="full">
            <mat-label>Contraseña</mat-label>
            <input matInput type="password" formControlName="password" autocomplete="off" />
          </mat-form-field>

          <button
            mat-raised-button
            color="primary"
            class="full"
            [disabled]="form.invalid || loading"
          >
            <span *ngIf="!loading">Entrar</span>
            <mat-spinner *ngIf="loading" diameter="18"></mat-spinner>
          </button>

          <p class="error" *ngIf="error">{{ error }}</p>
        </form>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .wrap {
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;

        /* Degradado */
        background: radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.22), transparent 45%),
          radial-gradient(circle at 80% 30%, rgba(37, 99, 235, 0.22), transparent 50%),
          linear-gradient(180deg, #ffffff, #f3f6ff);
      }

      .card {
        width: 380px;
        max-width: 95vw;
      }
      .full {
        width: 100%;
      }
      .error {
        margin-top: 12px;
        color: #c62828;
      }
      .logo-wrap {
        display: flex;
        justify-content: center;
        margin-bottom: 12px;
      }

      .logo {
        width: 72px;
        height: 72px;
        object-fit: contain;
      }
      .login-logo {
        display: flex;
        justify-content: center;
        margin-bottom: 12px;
      }

      .login-logo img {
        width: 78px;
        height: 78px;
      }
      .login-card {
        padding: 24px 28px 28px 28px; // top right bottom left
      }

      /* Opcional: mejorar separación del título */
      .login-card mat-card-title {
        margin-bottom: 4px;
      }

      .login-card mat-card-subtitle {
        margin-bottom: 20px;
      }
    `,
  ],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  loading = false;
  error = '';

  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;
    this.error = '';

    const { username, password } = this.form.getRawValue();
    console.log('PASSWORD RAW:', password, 'len=', password?.length);
    this.auth.login(username!, password!).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigateByUrl('/');
      },
      error: () => {
        this.loading = false;
        this.error = 'Usuario o contraseña incorrectos.';
      },
    });
  }
}
