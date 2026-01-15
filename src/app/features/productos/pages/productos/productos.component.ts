import { CommonModule } from '@angular/common';
import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { ProductoDialogComponent } from '../../ui/producto-dialog/producto-dialog.component';
import { ProductoApiService } from '../../api/producto-api.service';
import { Producto } from '../../api/producto.model';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { finalize } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { ChangeDetectionStrategy } from '@angular/core';
import { HasPermisoDirective } from '../../../../core/auth/has-permiso.directive';


@Component({
  standalone: true,
  selector: 'app-productos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSlideToggleModule,
    FormsModule,
    HasPermisoDirective,    
  ],
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.scss'],
})
export class ProductosComponent {
  private readonly api = inject(ProductoApiService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

 cols = ['descripcion', 'sku', 'precio', 'acciones'];

  // rows = signal<Producto[]>([]);
  rows = signal<(Producto & { _saving?: boolean })[]>([]);
  total = signal(0);
  page = signal(0);
  size = signal(10);
  q = signal('');
  sort = signal('id,desc'); // ajustá si querés otro default

  constructor() {
    effect(() => {
      this.load();
    });
  }

  load() {
    this.api
      .search(this.q(), this.page(), this.size(), this.sort())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.rows.set(res.content ?? []);
        this.total.set(res.totalElements ?? 0);
      });
  }

  onSearch(value: string) {
    this.q.set(value);
    this.page.set(0);
    this.load();
  }

  onPage(e: PageEvent) {
    this.page.set(e.pageIndex);
    this.size.set(e.pageSize);
    this.load();
  }

  openCreate() {
    const ref = this.dialog.open(ProductoDialogComponent, { data: { mode: 'create' } });
    ref.afterClosed().subscribe((dto) => {
      if (!dto) return;
      this.api.create(dto).subscribe(() => this.load());
    });
  }

  openEdit(p: Producto) {
    const ref = this.dialog.open(ProductoDialogComponent, { data: { mode: 'edit', producto: p } });
    ref.afterClosed().subscribe((dto) => {
      if (!dto) return;
      this.api.update(p.id, dto).subscribe(() => this.load());
    });
  }

  remove(p: Producto) {
    if (!confirm(`Eliminar producto "${p.descripcion}"?`)) return;
    this.api.delete(p.id).subscribe(() => this.load());
  }

}
