import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { Producto } from '../../api/producto.model';

export type ProductoDialogData =
  | { mode: 'create' }
  | { mode: 'edit'; producto: Producto };

@Component({
  standalone: true,
  selector: 'app-producto-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
  ],
  templateUrl: './producto-dialog.component.html',
  styleUrls: ['./producto-dialog.component.scss'],
})
export class ProductoDialogComponent {
  form;

  constructor(
    private fb: FormBuilder,
    private ref: MatDialogRef<ProductoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProductoDialogData
  ) {
    this.form = this.fb.group({
      sku: ['', [Validators.required, Validators.maxLength(60)]],  
      descripcion: ['', [Validators.required, Validators.maxLength(250)]],
      precio: [0, [Validators.required, Validators.min(0)]]
    });

    if (data.mode === 'edit') {
      this.form.patchValue({
        sku: data.producto.sku ?? '',
        descripcion: data.producto.descripcion ?? '',
        precio: Number(data.producto.precio ?? 0),
      });
    }
  }

  cancel() {
    this.ref.close(null);
  }

  save() {
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();

    const dto = {
      sku: raw.sku ?? '',
      descripcion: raw.descripcion ?? '',
      precio: raw.precio ?? 0,
    };

    this.ref.close(dto);
  }
}
