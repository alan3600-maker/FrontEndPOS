import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface SimpleCatalogoDialogData {
  // compat: algunas pantallas envían 'titulo'
  title?: string;
  titulo?: string;
  nombre?: string | null;
}

@Component({
  selector: 'app-simple-catalogo-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.title || data.titulo }}</h2>
    <div mat-dialog-content>
      <form [formGroup]="form" class="form">
        <mat-form-field appearance="outline">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="nombre" />
          <mat-error *ngIf="form.controls.nombre.invalid">Ingresá un nombre</mat-error>
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
        padding-top: 8px;
        min-width: 340px;
      }
      mat-form-field {
        width: 100%;
      }
    `,
  ],
})
export class SimpleCatalogoDialogComponent {
  readonly data = inject<SimpleCatalogoDialogData>(MAT_DIALOG_DATA);
  readonly ref = inject(MatDialogRef<SimpleCatalogoDialogComponent, { nombre: string }>);

  form = new FormGroup({
    nombre: new FormControl(this.data.nombre ?? '', { nonNullable: true, validators: [Validators.required] }),
  });

  guardar() {
    if (this.form.invalid) return;
    this.ref.close({ nombre: this.form.controls.nombre.value.trim() });
  }
}
