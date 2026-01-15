import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ClientesService } from '../../api/clientes.service';
import { Cliente } from '../../api/clientes.models';
import { HasPermisoDirective } from '../../../../core/auth/has-permiso.directive';

@Component({
  standalone: true,
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss'],
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
    HasPermisoDirective
  ]
})
export class ClientesComponent {
  private readonly api = inject(ClientesService);
  private readonly dialog = inject(MatDialog);

  cols = ['nombreRazonSocial', 'ruc', 'telefono', 'acciones'];

  rows = signal<Cliente[]>([]);
  total = signal(0);
  page = signal(0);
  size = signal(10);
  q = signal('');

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.listPaged(this.page(), this.size(), this.q()).subscribe({
      next: (res) => {
        this.rows.set(res.content);
        this.total.set(res.totalElements);
      },
      error: (err) => console.error(err)
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

  async openCreate() {
    const { ClienteDialogComponent } = await import('../../components/cliente-dialog/cliente-dialog.component');
    const ref = this.dialog.open(ClienteDialogComponent, { width: '520px', data: { mode: 'create' } });
    ref.afterClosed().subscribe(ok => { if (ok) this.load(); });
  }

  async openEdit(r: Cliente) {
    const { ClienteDialogComponent } = await import('../../components/cliente-dialog/cliente-dialog.component');
    const ref = this.dialog.open(ClienteDialogComponent, { width: '520px', data: { mode: 'edit', cliente: r } });
    ref.afterClosed().subscribe(ok => { if (ok) this.load(); });
  }

  remove(r: Cliente) {
    if (!confirm(`Eliminar cliente: ${r.nombreRazonSocial}?`)) return;
    this.api.delete(r.id).subscribe({ next: () => this.load() });
  }
}
