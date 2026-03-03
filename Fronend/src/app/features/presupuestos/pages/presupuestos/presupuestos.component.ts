import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { PresupuestosApiService, PresupuestoDto } from '../../services/presupuestos.api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-presupuestos',
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatProgressBarModule, MatTableModule],
  templateUrl: './presupuestos.component.html',
})
export class PresupuestosComponent {
  private api = inject(PresupuestosApiService);
  private router = inject(Router);

  loading = signal(false);
  presupuestos = signal<PresupuestoDto[]>([]);

  displayedColumns = ['id', 'fecha', 'estado', 'cliente', 'total'];
  cols = this.displayedColumns;

  constructor() {
    this.refrescar();
  }

  async refrescar() {
    this.loading.set(true);
    try {
      const list = await firstValueFrom(this.api.listar());
      this.presupuestos.set(list ?? []);
    } finally {
      this.loading.set(false);
    }
  }

  nuevo() {
    this.router.navigateByUrl('/presupuestos/nuevo');
  }
}
