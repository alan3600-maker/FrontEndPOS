import { CommonModule } from '@angular/common';
import { Component, Inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';

export interface ClienteDto {
  id: number;
  nombreRazonSocial: string;
  ruc?: string;
  telefono?: string;
  direccion?: string;
  email?: string;
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
  selector: 'app-cliente-picker-dialog',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
  ],
  templateUrl: './cliente-picker-dialog.component.html',
  styleUrls: ['./cliente-picker-dialog.component.scss'],
})
export class ClientePickerDialogComponent {
  private readonly base = 'http://localhost:8080/api/v1';

  q = signal('');
  rows = signal<ClienteDto[]>([]);
  loading = signal(false);

  constructor(
    private http: HttpClient,
    private ref: MatDialogRef<ClientePickerDialogComponent>,
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
      .get<PageResponse<ClienteDto>>(`${this.base}/clientes/search`, { params: params as any })
      .subscribe({
        next: (res) => this.rows.set(res.content ?? []),
        error: () => this.rows.set([]),
        complete: () => this.loading.set(false),
      });
  }

  pick(c: ClienteDto) {
    this.ref.close(c);
  }

  close() {
    this.ref.close(null);
  }
}
