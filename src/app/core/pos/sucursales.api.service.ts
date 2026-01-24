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

  listar(soloActivas = true) {
    return this.http.get<SucursalDto[]>(`${this.base}/api/sucursales`, {
      params: { soloActivas: String(soloActivas) },
    });
  }

  crear(body: Partial<SucursalDto>) {
    return this.http.post<SucursalDto>(`${this.base}/api/sucursales`, body);
  }
}
