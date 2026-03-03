import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Cliente } from './clientes.models';

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private readonly http = inject(HttpClient);

  listPaged(page = 0, size = 10, q?: string) {
    let params = new HttpParams().set('page', page).set('size', size);
    if (q && q.trim().length) params = params.set('q', q.trim());
    return this.http.get<PageResponse<Cliente>>(`${environment.apiUrl}/api/v1/clientes/search`, {
      params,
    });
  }

  create(dto: Partial<Cliente>) {
    return this.http.post<Cliente>(`${environment.apiUrl}/api/v1/clientes`, dto);
  }

  update(id: number, dto: Partial<Cliente>) {
    return this.http.put<Cliente>(`${environment.apiUrl}/api/v1/clientes/${id}`, dto);
  }

  delete(id: number) {
    return this.http.delete<void>(`${environment.apiUrl}/api/v1/clientes/${id}`);
  }
}
