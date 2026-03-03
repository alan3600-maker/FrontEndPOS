import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { MarcasApiService, MarcaDto } from '../../services/marcas.api.service';
import { SimpleCatalogoDialogComponent } from '../../ui/simple-catalogo-dialog/simple-catalogo-dialog.component';

@Component({
  standalone: true,
  selector: 'app-marcas',
  templateUrl: './marcas.component.html',
  styleUrls: ['./marcas.component.scss'],
  imports: [
    CommonModule,
    // Material
    MatDialogModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
  ],
})
export class MarcasComponent {
  private readonly api = inject(MarcasApiService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);

  cols = ['id', 'nombre', 'activo', 'acciones'];

  rows = signal<MarcaDto[]>([]);
  total = signal(0);
  page = signal(0);
  size = signal(10);
  q = signal('');

  loading = signal(false);

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.api.listPaged(this.page(), this.size(), this.q()).subscribe({
      next: (res) => {
        this.rows.set(res.content ?? []);
        this.total.set(res.totalElements ?? 0);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.rows.set([]);
        this.total.set(0);
        this.loading.set(false);
      },
    });
  }

  onPage(e: PageEvent) {
    this.page.set(e.pageIndex);
    this.size.set(e.pageSize);
    this.load();
  }

  onSearch(value: string) {
    this.q.set(value ?? '');
    this.page.set(0);
    this.load();
  }

  crear() {
    const ref = this.dialog.open(SimpleCatalogoDialogComponent, {
      width: '420px',
      data: { titulo: 'Nueva marca', nombre: '' },
    });

    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      this.loading.set(true);
      this.api.crear({ nombre: result.nombre }).subscribe({
        next: () => {
          this.snack.open('Marca creada', 'OK', { duration: 1500 });
          this.load();
        },
        error: (err) => {
          console.error(err);
          this.loading.set(false);
        },
      });
    });
  }

  editar(row: MarcaDto) {
    const ref = this.dialog.open(SimpleCatalogoDialogComponent, {
      width: '420px',
      data: { titulo: 'Editar marca', nombre: row.nombre },
    });

    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      this.loading.set(true);
      this.api.actualizar(row.id, { nombre: result.nombre }).subscribe({
        next: () => {
          this.snack.open('Marca actualizada', 'OK', { duration: 1500 });
          this.load();
        },
        error: (err) => {
          console.error(err);
          this.loading.set(false);
        },
      });
    });
  }

  toggleActivo(row: MarcaDto) {
    const nextActivo = !Boolean(row.activo);
    this.loading.set(true);
    this.api.setActivo(row.id, nextActivo).subscribe({
      next: () => {
        this.snack.open(nextActivo ? 'Marca activada' : 'Marca desactivada', 'OK', { duration: 1500 });
        this.load();
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
      },
    });
  }
}
