import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';

export interface ProveedorDto {
  id: number;
  nombreRazonSocial: string;
  ruc?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  activo?: boolean;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class ProveedoresApiService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/api/v1/proveedores`;

  // Igual que Clientes: endpoint /search paginado + filtro q
  listPaged(page = 0, size = 10, q?: string) {
    let params = new HttpParams().set('page', page).set('size', size);
    if (q && q.trim().length) params = params.set('q', q.trim());
    return this.http.get<PageResponse<ProveedorDto>>(`${this.url}/search`, { params });
  }

  // Mantener por compatibilidad (combos antiguos), preferir listPaged para la grilla
  listar() {
    return this.http.get<ProveedorDto[]>(this.url);
  }

  crear(body: Partial<ProveedorDto>) {
    return this.http.post<ProveedorDto>(this.url, body);
  }

  actualizar(id: number, body: Partial<ProveedorDto>) {
    return this.http.put<ProveedorDto>(`${this.url}/${id}`, body);
  }

  activar(id: number) {
    return this.http.put<void>(`${this.url}/${id}/activar`, {});
  }

  desactivar(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  setActivo(id: number, activo: boolean) {
    return activo ? this.activar(id) : this.desactivar(id);
  }
}
