import { CommonModule } from '@angular/common';
import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReportesVentasApiService } from '../../api/reportes-ventas.api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-reportes-ventas',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
  ],
  template: `
  <mat-card>
    <mat-card-title>Reportes de ventas</mat-card-title>
    <mat-card-content>
      <div class="grid">
        <div class="block">
          <h3>Diario</h3>
          <mat-form-field appearance="outline" class="full">
            <mat-label>Fecha (YYYY-MM-DD)</mat-label>
            <input matInput [(ngModel)]="fecha" placeholder="2026-03-02" />
          </mat-form-field>
          <button mat-flat-button color="primary" (click)="pdfDiario()" [disabled]="busy()">Abrir PDF</button>
        </div>

        <div class="block">
          <h3>Mensual</h3>
          <div class="row">
            <mat-form-field appearance="outline" class="full">
              <mat-label>Año</mat-label>
              <input matInput type="number" [(ngModel)]="anioMes" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full">
              <mat-label>Mes</mat-label>
              <input matInput type="number" [(ngModel)]="mes" />
            </mat-form-field>
          </div>
          <button mat-flat-button color="primary" (click)="pdfMensual()" [disabled]="busy()">Abrir PDF</button>
        </div>

        <div class="block">
          <h3>Anual</h3>
          <mat-form-field appearance="outline" class="full">
            <mat-label>Año</mat-label>
            <input matInput type="number" [(ngModel)]="anio" />
          </mat-form-field>
          <button mat-flat-button color="primary" (click)="pdfAnual()" [disabled]="busy()">Abrir PDF</button>
        </div>
      </div>
    </mat-card-content>
  </mat-card>
  `,
  styles: [`
    .grid{ display:grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap:16px; }
    .block{ padding: 10px 6px; }
    .full{ width:100%; }
    .row{ display:flex; gap:12px; }
    h3{ margin: 6px 0 10px; }
  `],
})
export class ReportesVentasComponent {
  private api = inject(ReportesVentasApiService);
  private snack = inject(MatSnackBar);

  busy = signal(false);

  // defaults
  fecha = new Date().toISOString().slice(0, 10);
  anioMes = new Date().getFullYear();
  mes = new Date().getMonth() + 1;
  anio = new Date().getFullYear();

  async pdfDiario() {
    try {
      this.busy.set(true);
      const blob = await firstValueFrom(this.api.diario(this.fecha));
      if (blob) this.api.openPdf(blob);
    } catch (e) {
      this.snack.open('No se pudo generar el reporte diario.', 'OK', { duration: 3500 });
    } finally {
      this.busy.set(false);
    }
  }

  async pdfMensual() {
    try {
      this.busy.set(true);
      const blob = await firstValueFrom(this.api.mensual(this.anioMes, this.mes));
      if (blob) this.api.openPdf(blob);
    } catch {
      this.snack.open('No se pudo generar el reporte mensual.', 'OK', { duration: 3500 });
    } finally {
      this.busy.set(false);
    }
  }

  async pdfAnual() {
    try {
      this.busy.set(true);
      const blob = await firstValueFrom(this.api.anual(this.anio));
      if (blob) this.api.openPdf(blob);
    } catch {
      this.snack.open('No se pudo generar el reporte anual.', 'OK', { duration: 3500 });
    } finally {
      this.busy.set(false);
    }
  }
}
