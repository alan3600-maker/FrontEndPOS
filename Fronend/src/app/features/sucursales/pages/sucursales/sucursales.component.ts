import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { firstValueFrom } from 'rxjs';
import { SucursalDialogComponent, SucursalDialogData } from '../../ui/sucursal-dialog/sucursal-dialog.component';
import { SucursalDto, SucursalesApiService } from '../../../../core/pos/sucursales.api.service';

@Component({
  selector: 'app-sucursales',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressBarModule,
    MatDialogModule,
  ],
  templateUrl: './sucursales.component.html',
})
export class SucursalesComponent {
  private api = inject(SucursalesApiService);
  private dialog = inject(MatDialog);

  loading = signal(false);
  rows = signal<SucursalDto[]>([]);

  displayedColumns = ['id', 'nombre', 'direccion', 'telefono', 'activo', 'acciones'];

  constructor() {
    this.reload();
  }

  async reload() {
    this.loading.set(true);
    try {
      const list = await firstValueFrom(this.api.listar(false));
      this.rows.set(list);
    } finally {
      this.loading.set(false);
    }
  }

  async crear() {
    const ref = this.dialog.open<SucursalDialogComponent, SucursalDialogData, Partial<SucursalDto> | null>(
      SucursalDialogComponent,
      {
        width: '520px',
        data: { title: 'Nueva sucursal' },
      }
    );

    const result = await firstValueFrom(ref.afterClosed());
    if (!result) return;
    await firstValueFrom(this.api.crear(result));
    await this.reload();
  }

  async editar(row: SucursalDto) {
    const ref = this.dialog.open<SucursalDialogComponent, SucursalDialogData, Partial<SucursalDto> | null>(
      SucursalDialogComponent,
      {
        width: '520px',
        data: { title: 'Editar sucursal', initial: row },
      }
    );

    const result = await firstValueFrom(ref.afterClosed());
    if (!result) return;
    await firstValueFrom(this.api.actualizar(row.id, result));
    await this.reload();
  }

  async toggleActivo(row: SucursalDto) {
    if (row.activo) await firstValueFrom(this.api.desactivar(row.id));
    else await firstValueFrom(this.api.activar(row.id));
    await this.reload();
  }
}
