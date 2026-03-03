import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';

import { PosContextService } from '../../pos-context.service';
import { CajaTurnosApiService, ArqueoCajaDto } from '../../caja-turnos.api.service';
import { CajaMovimientosApiService, CajaMovimientoDto } from '../../caja-movimientos.api.service';

@Component({
  standalone: true,
  selector: 'app-arqueo-caja',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSnackBarModule,
  ],
  template: `
  <mat-card>
    <mat-card-title>Arqueo de caja</mat-card-title>
    <mat-card-content>

      <div class="warn" *ngIf="!turnoId()">
        No hay turno abierto para la caja configurada. Abrí la caja desde "Nueva venta".
      </div>

      <div *ngIf="turnoId()">
        <div class="row">
          <div class="kpi">
            <div class="lbl">Monto inicial</div>
            <div class="val">{{ arqueo()?.montoInicial ?? 0 | number:'1.0-2' }}</div>
          </div>
          <div class="kpi">
            <div class="lbl">Total ventas</div>
            <div class="val">{{ arqueo()?.totalVentas ?? 0 | number:'1.0-2' }}</div>
          </div>
          <div class="kpi">
            <div class="lbl">Salidas</div>
            <div class="val">{{ arqueo()?.totalEgresos ?? 0 | number:'1.0-2' }}</div>
          </div>
          <div class="kpi">
            <div class="lbl">Ingresos</div>
            <div class="val">{{ arqueo()?.totalIngresos ?? 0 | number:'1.0-2' }}</div>
          </div>
          <div class="kpi">
            <div class="lbl">Saldo efectivo esperado</div>
            <div class="val">{{ arqueo()?.saldoEfectivoEsperado ?? 0 | number:'1.0-2' }}</div>
          </div>
        </div>

        <h3>Movimientos manuales</h3>
        <div class="row2">
          <mat-form-field appearance="outline" class="w">
            <mat-label>Monto salida</mat-label>
            <input matInput type="number" [(ngModel)]="montoSalida" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="grow">
            <mat-label>Motivo</mat-label>
            <input matInput [(ngModel)]="motivo" />
          </mat-form-field>
          <button mat-flat-button color="primary" (click)="registrarSalida()" [disabled]="busy()">Registrar salida</button>
        </div>

        <table mat-table [dataSource]="movimientos()" class="mat-elevation-z1">
          <ng-container matColumnDef="fecha">
            <th mat-header-cell *matHeaderCellDef>Fecha</th>
            <td mat-cell *matCellDef="let m">{{ m.fecha | date:'short' }}</td>
          </ng-container>
          <ng-container matColumnDef="tipo">
            <th mat-header-cell *matHeaderCellDef>Tipo</th>
            <td mat-cell *matCellDef="let m">{{ m.tipo }}</td>
          </ng-container>
          <ng-container matColumnDef="monto">
            <th mat-header-cell *matHeaderCellDef>Monto</th>
            <td mat-cell *matCellDef="let m">{{ m.monto | number:'1.0-2' }}</td>
          </ng-container>
          <ng-container matColumnDef="motivo">
            <th mat-header-cell *matHeaderCellDef>Motivo</th>
            <td mat-cell *matCellDef="let m">{{ m.motivo || '-' }}</td>
          </ng-container>
          <ng-container matColumnDef="acciones">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let m">
              <button mat-button (click)="eliminar(m.id)" [disabled]="busy()">Eliminar</button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="cols"></tr>
          <tr mat-row *matRowDef="let row; columns: cols"></tr>
        </table>

        <h3>Cierre</h3>
        <div class="row2">
          <mat-form-field appearance="outline" class="w">
            <mat-label>Monto declarado (total)</mat-label>
            <input matInput type="number" [(ngModel)]="montoDeclarado" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="grow">
            <mat-label>Observación</mat-label>
            <input matInput [(ngModel)]="observacion" />
          </mat-form-field>
          <button mat-flat-button color="warn" (click)="cerrar()" [disabled]="busy()">Cerrar turno</button>
        </div>

        <div class="kpi2">
          <div><b>Total esperado:</b> {{ arqueo()?.totalEsperado ?? 0 | number:'1.0-2' }}</div>
          <div><b>Diferencia:</b> {{ arqueo()?.diferencia ?? 0 | number:'1.0-2' }}</div>
        </div>
      </div>
    </mat-card-content>
  </mat-card>
  `,
  styles: [`
    .warn{ padding:12px; border:1px solid rgba(0,0,0,.12); border-radius:12px; background: rgba(255,193,7,.10); }
    .row{ display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:12px; margin: 12px 0; }
    .kpi{ border:1px solid rgba(0,0,0,.12); border-radius:12px; padding:10px 12px; }
    .lbl{ opacity:.75; font-size:12px; }
    .val{ font-size:18px; font-weight:600; }
    .row2{ display:flex; gap:12px; align-items:center; margin: 10px 0 14px; flex-wrap:wrap; }
    .w{ width:220px; }
    .grow{ flex:1; min-width:240px; }
    table{ width:100%; margin: 10px 0 16px; }
    h3{ margin: 12px 0 6px; }
    .kpi2{ display:flex; gap:24px; margin-top: 8px; }
  `],
})
export class ArqueoCajaComponent {
  readonly pos = inject(PosContextService);
  private turnosApi = inject(CajaTurnosApiService);
  private movApi = inject(CajaMovimientosApiService);
  private snack = inject(MatSnackBar);

  busy = signal(false);
  arqueo = signal<ArqueoCajaDto | null>(null);
  movimientos = signal<CajaMovimientoDto[]>([]);

  turnoId = computed(() => this.pos.turnoId());
  cols = ['fecha', 'tipo', 'monto', 'motivo', 'acciones'];

  montoSalida = 0;
  motivo = '';
  montoDeclarado = 0;
  observacion = '';

  constructor() {
    effect(() => {
      const id = this.turnoId();
      if (!id) {
        this.arqueo.set(null);
        this.movimientos.set([]);
        return;
      }
      this.refresh();
    });
  }

  async refresh() {
    const id = this.turnoId();
    if (!id) return;
    try {
      this.busy.set(true);
      const [a, m] = await Promise.all([
        firstValueFrom(this.turnosApi.arqueo(id)),
        firstValueFrom(this.movApi.listar(id)),
      ]);
      this.arqueo.set(a);
      this.movimientos.set(m);
    } catch {
      this.snack.open('No se pudo cargar el arqueo.', 'OK', { duration: 3500 });
    } finally {
      this.busy.set(false);
    }
  }

  async registrarSalida() {
    const id = this.turnoId();
    if (!id) return;
    try {
      this.busy.set(true);
      await firstValueFrom(
        this.movApi.crear({ turnoId: id, tipo: 'EGRESO', monto: Number(this.montoSalida || 0), motivo: this.motivo })
      );
      this.montoSalida = 0;
      this.motivo = '';
      await this.refresh();
    } catch {
      this.snack.open('No se pudo registrar la salida.', 'OK', { duration: 3500 });
    } finally {
      this.busy.set(false);
    }
  }

  async eliminar(id: number) {
    try {
      this.busy.set(true);
      await firstValueFrom(this.movApi.eliminar(id));
      await this.refresh();
    } catch {
      this.snack.open('No se pudo eliminar el movimiento.', 'OK', { duration: 3500 });
    } finally {
      this.busy.set(false);
    }
  }

  async cerrar() {
    const id = this.turnoId();
    if (!id) return;
    try {
      this.busy.set(true);
      await firstValueFrom(this.turnosApi.cerrar(id, Number(this.montoDeclarado || 0), this.observacion));
      this.pos.clearTurno();
      this.snack.open('Turno cerrado.', 'OK', { duration: 2500 });
    } catch {
      this.snack.open('No se pudo cerrar el turno.', 'OK', { duration: 3500 });
    } finally {
      this.busy.set(false);
    }
  }
}
