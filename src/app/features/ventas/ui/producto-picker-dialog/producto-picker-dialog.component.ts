import { CommonModule } from '@angular/common';
import { Component, Inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';

export interface ProductoDto {
  id: number;
  sku: string;
  descripcion: string;
  precio: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Component({
  standalone: true,
  selector: 'app-producto-picker-dialog',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
  ],
  templateUrl: './producto-picker-dialog.component.html',
  styleUrls: ['./producto-picker-dialog.component.scss'],
})
export class ProductoPickerDialogComponent {
  private readonly base = 'http://localhost:8080/api/v1';

  q = signal('');
  rows = signal<ProductoDto[]>([]);
  loading = signal(false);

  constructor(
    private http: HttpClient,
    private ref: MatDialogRef<ProductoPickerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {}
  ) {
    this.search('');
  }

  onInput(value: string) {
    this.q.set(value ?? '');
    this.search(this.q());
  }

  search(q: string) {
    this.loading.set(true);

    const params = {
      q: (q ?? '').trim(),
      page: 0,
      size: 10,
      sortBy: 'id',
      dir: 'desc',
    };

    this.http
      .get<PageResponse<ProductoDto>>(`${this.base}/productos/search`, { params: params as any })
      .subscribe({
        next: (res) => this.rows.set(res.content ?? []),
        error: () => this.rows.set([]),
        complete: () => this.loading.set(false),
      });
  }

  pick(p: ProductoDto) {
    this.ref.close(p);
  }

  close() {
    this.ref.close(null);
  }
}
