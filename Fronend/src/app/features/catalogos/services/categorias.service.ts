import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface Categoria {
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
export class CategoriasService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1/categorias`;

  listPaged(page = 0, size = 10, q?: string) {
    let params = new HttpParams().set('page', page).set('size', size);
    if (q && q.trim().length) params = params.set('q', q.trim());

    // patrón Cliente: /search
    return this.http.get<PageResponse<Categoria>>(`${this.baseUrl}/search`, { params });
  }

  create(dto: Partial<Categoria>) {
    return this.http.post<Categoria>(this.baseUrl, dto);
  }

  update(id: number, dto: Partial<Categoria>) {
    return this.http.put<Categoria>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number) {
    // soft delete/desactivar
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  activar(id: number) {
    return this.http.put<void>(`${this.baseUrl}/${id}/activar`, {});
  }
}
