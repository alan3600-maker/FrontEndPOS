import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import type { SucursalDto } from '../../../../core/pos/sucursales.api.service';

export type SucursalDialogData = {
  title: string;
  sucursal?: SucursalDto;
  // compat
  initial?: SucursalDto;
};

@Component({
  standalone: true,
  selector: 'app-sucursal-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <div mat-dialog-content>
      <form [formGroup]="form" class="form">
        <mat-form-field appearance="outline">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="nombre" />
          <mat-error *ngIf="form.controls.nombre.invalid">Requerido</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Dirección</mat-label>
          <input matInput formControlName="direccion" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Teléfono</mat-label>
          <input matInput formControlName="telefono" />
        </mat-form-field>
      </form>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button (click)="ref.close()">Cancelar</button>
      <button mat-raised-button color="primary" (click)="guardar()" [disabled]="form.invalid">
        Guardar
      </button>
    </div>
  `,
  styles: [
    `
      .form {
        display: grid;
        gap: 12px;
        padding-top: 8px;
        min-width: 320px;
      }
    `,
  ],
})
export class SucursalDialogComponent {
  readonly ref = inject(MatDialogRef<SucursalDialogComponent>);
  readonly data = inject<SucursalDialogData>(MAT_DIALOG_DATA);

  private readonly initial = this.data.sucursal ?? this.data.initial;

  readonly form = new FormGroup({
    nombre: new FormControl(this.initial?.nombre ?? '', { nonNullable: true, validators: [Validators.required] }),
    direccion: new FormControl(this.initial?.direccion ?? ''),
    telefono: new FormControl(this.initial?.telefono ?? ''),
  });

  guardar() {
    const v = this.form.getRawValue();
    this.ref.close({
      nombre: v.nombre.trim(),
      direccion: (v.direccion ?? '').trim() || null,
      telefono: (v.telefono ?? '').trim() || null,
    });
  }
}
