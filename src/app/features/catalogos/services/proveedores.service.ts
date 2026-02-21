import { HttpClient } from '@angular/common/http';
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

@Injectable({ providedIn: 'root' })
export class ProveedoresApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;
  private url = `${this.base}/api/v1/proveedores`;

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
    return this.http.post<ProveedorDto>(`${this.url}/${id}/activar`, {});
  }

  desactivar(id: number) {
    return this.http.post<ProveedorDto>(`${this.url}/${id}/desactivar`, {});
  }
}
