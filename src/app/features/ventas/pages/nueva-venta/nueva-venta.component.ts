import { CommonModule } from '@angular/common';
import { Component, computed, signal, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';


import { ClienteDto, ProductoDto, VentaItemDraft, VentaRequest } from '../../api/ventas.model';
import { ClientePickerDialogComponent } from '../../ui/cliente-picker-dialog/cliente-picker-dialog.component';
import { ProductoPickerDialogComponent } from '../../ui/producto-picker-dialog/producto-picker-dialog.component';
import { VentasApi } from '../../api/ventas.api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../../../environments/environment';

// ✅ Poné acá el ID real del depósito principal en tu BD
const DEFAULT_DEPOSITO_ID = 1;
// ✅ Caja por defecto (local). Ideal: seleccionar caja en UI.
const DEFAULT_CAJA_ID = environment.defaultCajaId ?? 1;

@Component({
  standalone: true,
  selector: 'app-nueva-venta',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatInputModule,
    MatDialogModule,
  ],
  templateUrl: './nueva-venta.component.html',
  styleUrls: ['./nueva-venta.component.scss'],
})
export class NuevaVentaComponent {
  private dialog = inject(MatDialog);
  private api = inject(VentasApi);
  private snack = inject(MatSnackBar);

  cliente = signal<ClienteDto | null>(null);
  ventaId = signal<number | null>(null);
  items = signal<(VentaItemDraft & { descripcion?: string; sku?: string })[]>([]);
  busy = signal(false);
  ventaFinalizada = signal(false);

  public resetVenta() {
    this.cliente.set(null);
    this.items.set([]);
    this.ventaId.set(null);
    this.ventaFinalizada.set(false);
  }

  cols = ['descripcion', 'precio', 'cantidad', 'total', 'acciones'];

  total = computed(() =>
    this.items().reduce((acc, it) => acc + Number(it.precioUnitario) * Number(it.cantidad), 0)
  );

  async pickCliente() {
    const ref = this.dialog.open(ClientePickerDialogComponent, { width: '620px' });
    const c = (await firstValueFrom(ref.afterClosed())) as ClienteDto | null;
    if (!c) return;

    this.cliente.set(c);
  }

  async addProducto() {
    if (!this.cliente()) return;

    const ref = this.dialog.open(ProductoPickerDialogComponent, { width: '720px' });
    const p = (await firstValueFrom(ref.afterClosed())) as ProductoDto | null;
    if (!p) return;

    const arr = [...this.items()];
    const idx = arr.findIndex((x) => x.productoId === p.id);

    if (idx >= 0) {
      arr[idx] = { ...arr[idx], cantidad: Number(arr[idx].cantidad) + 1 };
    } else {
      arr.push({
        productoId: p.id,
        sku: p.sku,
        descripcion: p.descripcion,
        precioUnitario: Number(p.precio ?? 0),
        cantidad: 1,
      });
    }

    this.items.set(arr);
  }

  removeItem(i: number) {
    const arr = [...this.items()];
    arr.splice(i, 1);
    this.items.set(arr);
  }

  updateQty(i: number, qty: number) {
    const arr = [...this.items()];
    arr[i] = { ...arr[i], cantidad: Math.max(1, Number(qty || 1)) };
    this.items.set(arr);
  }

  // Guardar items en backend (borrador)
  syncItems() {
    const ventaId = this.ventaId();
    const req = this.buildVentaRequest();
    if (!ventaId || !req) return;

    this.busy.set(true);
    this.api.updateVenta(ventaId, req).subscribe({
      next: () => this.busy.set(false),
      error: () => this.busy.set(false),
    });
  }

  // Confirmar + Emitir + Abrir PDF
  confirmarYEmitirTicket() {
    const req = this.buildVentaRequest();
    if (!req) return;

    this.busy.set(true);
    const ventaId = this.ventaId();

    const save$ = !ventaId ? this.api.createVenta(req) : this.api.updateVenta(ventaId, req);

    save$.subscribe({
      next: (v) => {
        const id = ventaId ?? v.id;
        if (!id) return this.busy.set(false);

        this.ventaId.set(id);

        this.api.confirmar(id, DEFAULT_CAJA_ID).subscribe({
          next: () => {
            this.api.emitirNoFiscal(id).subscribe({
              next: (fac) => {
                this.api.pdfTicket(fac.id).subscribe({
                  next: (blob) => {
                    this.api.openPdf(blob);

                    this.ventaFinalizada.set(true);
                    this.busy.set(false);
                    this.snack.open('Venta confirmada. Ticket generado.', 'Cerrar', {
                      duration: 3500,
                      verticalPosition: 'top',
                      horizontalPosition: 'center',
                    });
                  },
                  error: () => this.busy.set(false),
                });
              },
              error: () => this.busy.set(false),
            });
          },
          error: () => this.busy.set(false),
        });
      },
      error: () => this.busy.set(false),
    });
  }

  private buildVentaRequest(): VentaRequest | null {
    const c = this.cliente();
    const items = this.items();

    if (!c) return null;
    if (!items || items.length === 0) return null;

    return {
      clienteId: c.id,
      cajaId: DEFAULT_CAJA_ID,
      fecha: new Date().toISOString(),
      items: items.map((it) => ({
        tipo: 'PRODUCTO',
        productoId: it.productoId,
        depositoId: DEFAULT_DEPOSITO_ID,
        descripcion: it.descripcion ?? null,
        cantidad: it.cantidad,
        precioUnitario: it.precioUnitario,
      })),
    };
  }
   
  //helpers
  canGuardarBorrador = computed(() => {
    return !!this.ventaId() && !this.ventaFinalizada() && !this.busy();
  });

  canConfirmar = computed(() => {
    return !!this.cliente() && this.items().length > 0 && !this.ventaFinalizada() && !this.busy();
  });

  canNuevaVenta = computed(() => {
    return this.ventaFinalizada() && !this.busy();
  });
}
