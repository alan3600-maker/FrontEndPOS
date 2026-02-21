import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { firstValueFrom } from 'rxjs';
import { CajasApiService, CajaDto } from '../../core/pos/cajas.api.service';
import { PosContextService } from '../../core/pos/pos-context.service';
import { SucursalesApiService, SucursalDto } from '../../core/pos/sucursales.api.service';

@Component({
  selector: 'app-pos-settings-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    ReactiveFormsModule,
  ],
  template: `
    <h2 mat-dialog-title>Configuración POS</h2>

    <div mat-dialog-content class="content">
      <mat-form-field appearance="outline" class="full">
        <mat-label>Sucursal</mat-label>
        <mat-select [formControl]="sucursalIdCtrl" (selectionChange)="onSucursalChange()">
          <mat-option *ngFor="let s of sucursales()" [value]="s.id">
            {{ s.nombre }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full">
        <mat-label>Caja</mat-label>
        <mat-select [formControl]="cajaIdCtrl">
          <mat-option *ngFor="let c of cajas()" [value]="c.id">
            {{ c.nombre }} ({{ c.codigo }})
          </mat-option>
        </mat-select>
        <mat-error *ngIf="cajaIdCtrl.invalid">Seleccioná una caja</mat-error>
      </mat-form-field>

      <div class="row" *ngIf="sucursalIdCtrl.value && cajas().length === 0">
        <span class="muted">No hay cajas para esta sucursal.</span>
        <button mat-stroked-button (click)="crearCajaRapida()" [disabled]="busy()">
          Crear caja rápida
        </button>
      </div>

      <!-- fallback: si querés seguir pudiendo escribir un id manual -->
      <mat-form-field appearance="outline" class="full" *ngIf="false">
        <mat-label>Caja ID</mat-label>
        <input matInput type="number" />
      </mat-form-field>
    </div>

    <div mat-dialog-actions align="end">
      <button mat-button (click)="close()">Cancelar</button>
      <button mat-flat-button color="primary" (click)="save()" [disabled]="cajaIdCtrl.invalid || busy()">
        Guardar
      </button>
    </div>
  `,
  styles: [`
  /* 1) Dejá el contenedor del dialog SIN recorte */
  :host ::ng-deep .mat-mdc-dialog-content{
    overflow: visible !important;
    padding-top: 14px !important;  /* espacio para el label */
  }

  /* 2) Si querés scroll, que sea acá, no en mat-dialog-content */
  .content{
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 360px;

    max-height: 70vh;
    overflow: auto;

    padding-top: 6px;  /* extra margen arriba */
  }

  .full{ width: 100%; }

  /* Dale un poco más de aire al primer campo */
  mat-form-field{ display:block; }
  mat-form-field:first-of-type{ margin-top: 6px; }

  .row{ display:flex; align-items:center; justify-content:space-between; gap:12px; }
  .muted{ opacity: 0.7; }
`],
})
export class PosSettingsDialogComponent {
  private dialogRef = inject(MatDialogRef<PosSettingsDialogComponent>);
  private pos = inject(PosContextService);
  private sucursalesApi = inject(SucursalesApiService);
  private cajasApi = inject(CajasApiService);

  busy = signal(false);
  sucursales = signal<SucursalDto[]>([]);
  cajas = signal<CajaDto[]>([]);

  sucursalIdCtrl = new FormControl<number | null>(this.pos.sucursalId(), { nonNullable: false });
  cajaIdCtrl = new FormControl<number | null>(this.pos.cajaId(), {
    nonNullable: false,
    validators: [Validators.required],
  });

  constructor() {
    this.loadSucursales();
  }

  close() {
    this.dialogRef.close();
  }

  async loadSucursales() {
    try {
      this.busy.set(true);
      // backend: GET /api/sucursales?soloActivas=true
      const list = await firstValueFrom(this.sucursalesApi.listar(true));
      this.sucursales.set(list);

      // default: primera sucursal si no hay una seteada
      if (!this.sucursalIdCtrl.value && list.length > 0) {
        this.sucursalIdCtrl.setValue(list[0].id);
      }

      await this.onSucursalChange();
    } finally {
      this.busy.set(false);
    }
  }

  async onSucursalChange() {
    const sucursalId = this.sucursalIdCtrl.value;
    if (!sucursalId) {
      this.cajas.set([]);
      this.cajaIdCtrl.setValue(null);
      return;
    }

    try {
      this.busy.set(true);
      const list = await firstValueFrom(this.cajasApi.listarPorSucursal(sucursalId));
      this.cajas.set(list);

      // si la caja actual no está en esta sucursal, limpiar
      const current = this.cajaIdCtrl.value;
      if (current && !list.some((c) => c.id === current)) {
        this.cajaIdCtrl.setValue(null);
      }

      // auto seleccionar primera caja
      if (!this.cajaIdCtrl.value && list.length > 0) {
        this.cajaIdCtrl.setValue(list[0].id);
      }
    } finally {
      this.busy.set(false);
    }
  }

  async crearCajaRapida() {
    const sucursalId = this.sucursalIdCtrl.value;
    if (!sucursalId) return;

    try {
      this.busy.set(true);
      const caja = await firstValueFrom(this.cajasApi.crear(sucursalId, {
        nombre: 'Caja 1',
        codigo: 'CAJA-1',
      }));
      const list = await firstValueFrom(this.cajasApi.listarPorSucursal(sucursalId));
      this.cajas.set(list);
      this.cajaIdCtrl.setValue(caja.id);
    } finally {
      this.busy.set(false);
    }
  }

  save() {
    if (this.cajaIdCtrl.invalid) return;
    const sucursalId = this.sucursalIdCtrl.value ?? undefined;
    const cajaId = this.cajaIdCtrl.value ?? undefined;
    // Persistir contexto en storage para el POS
    this.pos.setSucursalId(sucursalId);
    this.pos.setCajaId(cajaId);
    this.pos.setTurnoId(undefined);
    this.dialogRef.close({ sucursalId, cajaId });
  }
}
