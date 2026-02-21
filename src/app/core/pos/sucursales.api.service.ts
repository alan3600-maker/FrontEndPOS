import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface SucursalDto {
  id: number;
  nombre: string;
  direccion?: string;
  telefono?: string;
  activo?: boolean;
}

@Injectable({ providedIn: 'root' })
export class SucursalesApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;
  private url = `${this.base}/api/v1/sucursales`;

  listar(soloActivas = true) {
    return this.http.get<SucursalDto[]>(`${this.url}`, {
      params: { soloActivas: String(soloActivas) },
    });
  }

  crear(body: Partial<SucursalDto>) {
    return this.http.post<SucursalDto>(`${this.url}`, body);
  }

  actualizar(id: number, body: Partial<SucursalDto>) {
    return this.http.put<SucursalDto>(`${this.url}/${id}`, body);
  }

  activar(id: number) {
    return this.http.post<SucursalDto>(`${this.url}/${id}/activar`, {});
  }

  desactivar(id: number) {
    return this.http.post<SucursalDto>(`${this.url}/${id}/desactivar`, {});
  }
}
