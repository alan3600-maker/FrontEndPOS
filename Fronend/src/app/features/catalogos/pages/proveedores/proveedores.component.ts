import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ProveedoresApiService, ProveedorDto } from '../../services/proveedores.api.service';

@Component({
  selector: 'app-proveedores',
  standalone: true,
  templateUrl: './proveedores.component.html',
  styleUrls: ['./proveedores.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatSnackBarModule,
  ],
})
export class ProveedoresComponent {
  private readonly api = inject(ProveedoresApiService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);

  @ViewChild('formDialog') formDialog!: TemplateRef<unknown>;

  cols = ['id', 'nombre', 'ruc', 'telefono', 'activo', 'acciones'];

  rows = signal<ProveedorDto[]>([]);
  total = signal(0);
  page = signal(0);
  size = signal(10);
  q = signal('');

  loading = signal(false);

  private editingId: number | null = null;

  form = new FormGroup({
    nombreRazonSocial: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    ruc: new FormControl<string>(''),
    telefono: new FormControl<string>(''),
    direccion: new FormControl<string>(''),
  });

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
    this.editingId = null;
    this.form.reset({ nombreRazonSocial: '', ruc: '', telefono: '', direccion: '' });
    this.dialog.open(this.formDialog, { width: '520px' });
  }

  editar(row: ProveedorDto) {
    this.editingId = row.id;
    this.form.reset({
      nombreRazonSocial: row.nombreRazonSocial ?? '',
      ruc: row.ruc ?? '',
      telefono: row.telefono ?? '',
      direccion: row.direccion ?? '',
    });
    this.dialog.open(this.formDialog, { width: '520px' });
  }

  guardar() {
    if (this.form.invalid) return;
    const body = this.form.getRawValue();

    this.loading.set(true);
    const req$ = this.editingId == null ? this.api.crear(body) : this.api.actualizar(this.editingId, body);

    req$.subscribe({
      next: () => {
        this.dialog.closeAll();
        this.snack.open(this.editingId == null ? 'Proveedor creado' : 'Proveedor actualizado', 'OK', {
          duration: 1500,
        });
        this.load();
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
      },
    });
  }

  toggleActivo(row: ProveedorDto) {
    const nextActivo = !Boolean(row.activo);
    this.loading.set(true);
    this.api.setActivo(row.id, nextActivo).subscribe({
      next: () => {
        this.snack.open(nextActivo ? 'Proveedor activado' : 'Proveedor desactivado', 'OK', { duration: 1500 });
        this.load();
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
      },
    });
  }
}
