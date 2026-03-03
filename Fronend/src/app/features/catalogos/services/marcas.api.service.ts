import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';

export interface MarcaDto {
  id: number;
  nombre: string;
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
export class MarcasApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/api/v1/marcas`;

  // Igual que Clientes: endpoint /search paginado + filtro q
  listPaged(page = 0, size = 10, q?: string) {
    let params = new HttpParams().set('page', page).set('size', size);
    if (q && q.trim().length) params = params.set('q', q.trim());
    return this.http.get<PageResponse<MarcaDto>>(`${this.url}/search`, { params });
  }

  crear(body: Partial<MarcaDto>) {
    return this.http.post<MarcaDto>(this.url, body);
  }

  actualizar(id: number, body: Partial<MarcaDto>) {
    return this.http.put<MarcaDto>(`${this.url}/${id}`, body);
  }

  // soft delete = desactivar
  desactivar(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  activar(id: number) {
    return this.http.put<void>(`${this.url}/${id}/activar`, {});
  }

  setActivo(id: number, activo: boolean) {
    return activo ? this.activar(id) : this.desactivar(id);
  }
}
