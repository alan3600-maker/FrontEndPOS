import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';

export interface CategoriaDto {
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
export class CategoriasApiService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/api/v1/categorias`;

  // Igual que Clientes: endpoint /search paginado + filtro q
  listPaged(page = 0, size = 10, q?: string) {
    let params = new HttpParams().set('page', page).set('size', size);
    if (q && q.trim().length) params = params.set('q', q.trim());
    return this.http.get<PageResponse<CategoriaDto>>(`${this.url}/search`, { params });
  }

  crear(body: Partial<CategoriaDto>) {
    return this.http.post<CategoriaDto>(this.url, body);
  }

  actualizar(id: number, body: Partial<CategoriaDto>) {
    return this.http.put<CategoriaDto>(`${this.url}/${id}`, body);
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
