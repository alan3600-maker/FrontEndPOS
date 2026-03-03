import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MovimientosStockApi } from '../../api/movimientos-stock.api.service';
import { DepositoDto } from '../../api/movimientos-stock.model';
import { ProductoDto } from '../../../ventas/api/ventas.model';
import { ProductoPickerDialogComponent } from '../../../ventas/ui/producto-picker-dialog/producto-picker-dialog.component';

import { firstValueFrom } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-stock-entrada',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './stock-entrada.component.html',
  styleUrls: ['./stock-entrada.component.scss'],
})
export class StockEntradaComponent {
  private api = inject(MovimientosStockApi);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  depositos = signal<DepositoDto[]>([]);
  producto = signal<ProductoDto | null>(null);
  busy = signal(false);

  form = this.fb.group({
    depositoId: [null as number | null, Validators.required],
    cantidad: [1, [Validators.required, Validators.min(1)]],
  });

  ngOnInit() {
    this.api.listDepositos().subscribe({
      next: (deps) => {
        this.depositos.set(deps);

        // ✅ default: selecciona el primer depósito si existe
        if (deps.length > 0 && !this.form.value.depositoId) {
          this.form.patchValue({ depositoId: deps[0].id });
        }
      },
    });
  }

  async pickProducto() {
    const ref = this.dialog.open(ProductoPickerDialogComponent, { width: '720px' });
    const p: ProductoDto | null = await firstValueFrom(ref.afterClosed());
    if (!p) return;
    this.producto.set(p);
  }

  canSave() {
    return this.form.valid && !!this.producto() && !this.busy();
  }

  guardar() {
    if (!this.canSave()) return;

    const depId = this.form.value.depositoId!;
    const qty = Number(this.form.value.cantidad);
    const p = this.producto()!;

    this.busy.set(true);

    this.api.crearEntrada(depId, p.id, qty).subscribe({
      next: () => {
        this.busy.set(false);

        // reset parcial: producto null y cantidad 1 (mantenemos deposito elegido)
        this.producto.set(null);
        this.form.patchValue({ cantidad: 1 });

        this.snack.open('Stock cargado correctamente', 'Cerrar', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
        });
      },
      error: () => this.busy.set(false),
    });
  }
}
