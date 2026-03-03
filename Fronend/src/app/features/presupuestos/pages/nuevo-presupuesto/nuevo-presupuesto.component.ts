import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';

import {
  ClienteDto,
  ClientePickerDialogComponent,
} from '../../../ventas/ui/cliente-picker-dialog/cliente-picker-dialog.component';
import {
  ProductoDto,
  ProductoPickerDialogComponent,
} from '../../../ventas/ui/producto-picker-dialog/producto-picker-dialog.component';

import {
  PresupuestosApiService,
  PresupuestoItemDto,
} from '../../services/presupuestos.api.service';

import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-nuevo-presupuesto',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatTableModule,
    MatSnackBarModule,
    MatFormFieldModule,
  ],
  templateUrl: './nuevo-presupuesto.component.html',
  styleUrl: './nuevo-presupuesto.component.scss',
})
export class NuevoPresupuestoComponent {
  private dialog = inject(MatDialog);
  private api = inject(PresupuestosApiService);
  private snack = inject(MatSnackBar);
  private router = inject(Router);

  private calcLinea(it: { cantidad: any; precioUnitario: any }) {
    const cant = Number(it.cantidad ?? 0);
    const precio = Number(it.precioUnitario ?? 0);
    return cant * precio;
  }

  loading = signal(false);
  cliente = signal<ClienteDto | null>(null);
  observacion = signal('');
  items = signal<PresupuestoItemDto[]>([]);

  cols = ['descripcion', 'cantidad', 'precio', 'total', 'acciones'];

  total = computed(() => this.items().reduce((acc, it) => acc + Number(it.totalLinea ?? 0), 0));

  busy() {
    return this.loading();
  }

  async pickCliente() {
    const ref = this.dialog.open(ClientePickerDialogComponent, { width: '900px' });
    const selected = await firstValueFrom(ref.afterClosed());
    if (selected) this.cliente.set(selected);
  }

  async addProducto() {
    const ref = this.dialog.open(ProductoPickerDialogComponent, { width: '900px' });
    const selected: ProductoDto | null = await firstValueFrom(ref.afterClosed());
    if (!selected) return;

    const item: PresupuestoItemDto = {
      tipo: 'PRODUCTO',
      productoId: selected.id,
      descripcion: selected.descripcion,
      cantidad: 1,
      precioUnitario: Number(selected.precio ?? 0),
      totalLinea: 0,
    };
    item.totalLinea = this.calcLinea(item);
    this.items.update((arr) => [...arr, item]);
  }

  remove(index: number) {
    this.items.update((arr) => arr.filter((_, i) => i !== index));
  }

  updateCantidad(index: number, value: string) {
    const v = Number(value);
    if (!Number.isFinite(v) || v <= 0) return;

    this.items.update((arr) =>
      arr.map((it, i) => {
        if (i !== index) return it;
        const next = { ...it, cantidad: v };
        return { ...next, totalLinea: this.calcLinea(next) };
      }),
    );
  }

  updatePrecio(index: number, value: string) {
    const v = Number(value);
    if (!Number.isFinite(v) || v < 0) return;

    this.items.update((arr) =>
      arr.map((it, i) => {
        if (i !== index) return it;
        const next = { ...it, precioUnitario: v };
        return { ...next, totalLinea: this.calcLinea(next) };
      }),
    );
  }

  async guardar() {
    if (!this.cliente()) {
      this.snack.open('Seleccioná un cliente', 'OK', { duration: 2000 });
      return;
    }
    if (this.items().length === 0) {
      this.snack.open('Agregá al menos un ítem', 'OK', { duration: 2000 });
      return;
    }

    this.loading.set(true);
    try {
      await firstValueFrom(
        this.api.crear({
          clienteId: this.cliente()!.id,
          observacion: this.observacion() || undefined,
          items: this.items(),
        }),
      );

      this.snack.open('Presupuesto guardado', 'OK', { duration: 2000 });
      await this.router.navigateByUrl('/presupuestos');
    } finally {
      this.loading.set(false);
    }
  }

  cancelar() {
    this.router.navigateByUrl('/presupuestos');
  }
}
