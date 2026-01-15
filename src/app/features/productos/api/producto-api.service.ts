import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Producto, ProductoCreateUpdate } from './producto.model';
import { API_URL } from '../../../core/config/api-url.token';

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class ProductoApiService {
  private readonly http = inject(HttpClient);
  private apiUrl = inject(API_URL);
  private readonly baseUrl = this.apiUrl + '/api/v1/productos';

  search(q: string, page: number, size: number, sort: string): Observable<PageResponse<Producto>> {
    let params = new HttpParams().set('page', page).set('size', size);

    if (q?.trim()) params = params.set('q', q.trim());
    if (sort?.trim()) params = params.set('sort', sort.trim());

    return this.http.get<PageResponse<Producto>>(`${this.baseUrl}/search`, { params });
  }

  create(dto: ProductoCreateUpdate) {
    return this.http.post<Producto>(this.baseUrl, dto);
  }

  update(id: number, dto: ProductoCreateUpdate) {
    return this.http.put<Producto>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
