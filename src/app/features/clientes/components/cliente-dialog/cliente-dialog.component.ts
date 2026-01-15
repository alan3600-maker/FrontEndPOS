import { Component, inject } from '@angular/core';
import { ClientesService } from '../../api/clientes.service';
import { Cliente } from '../../api/clientes.models';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';

type DialogData = { mode: 'create' } | { mode: 'edit'; cliente: Cliente };

@Component({
  standalone: true,
  templateUrl: './cliente-dialog.component.html',
  styleUrls: ['./cliente-dialog.component.scss'],
  imports: [
    CommonModule,
    // Material
    ReactiveFormsModule,
    MatDialogModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
})
export class ClienteDialogComponent {
  private readonly api = inject(ClientesService);
  private readonly fb = inject(FormBuilder);
  private readonly ref = inject(MatDialogRef<ClienteDialogComponent>);
  data = inject<DialogData>(MAT_DIALOG_DATA);
  private readonly snack = inject(MatSnackBar);

  title = this.data.mode === 'create' ? 'Nuevo cliente' : 'Editar cliente';

  form = this.fb.nonNullable.group({
    nombreRazonSocial: ['', Validators.required],
    ruc: [''],
    telefono: [''],
    direccion: [''],
    email: [''],
  });

  ngOnInit() {
    if (this.data.mode === 'edit') {
      const c = this.data.cliente;
      this.form.patchValue({
        nombreRazonSocial: c.nombreRazonSocial,
        ruc: c.ruc ?? '',
        telefono: c.telefono ?? '',
        direccion: c.direccion ?? '',
        email: c.email ?? '',
      });
    }
  }

  save() {
    const dto = this.form.getRawValue();

    const req$ =
      this.data.mode === 'create'
        ? this.api.create(dto)
        : this.api.update(this.data.cliente.id, dto);

    req$.subscribe({
      next: () => this.ref.close(true),
      error: (err: HttpErrorResponse) => {
        const msg =
          err.error && typeof err.error === 'object' && err.error.message
            ? err.error.message
            : err.message || 'Ocurrió un error';

        this.snack.open(msg, 'Cerrar', {
          duration: 4000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['snackbar-error'],
        });
      },
    });
  }

  close() {
    this.ref.close(false);
  }
}
