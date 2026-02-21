import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
// Evitamos el import absoluto "src/..." porque puede no existir el path alias en tsconfig.
import { environment } from '../../../environments/environment';

export interface CajaDto {
  id: number;
  sucursalId?: number;
  nombre: string;
  codigo: string;
  activo?: boolean;
}

@Injectable({ providedIn: 'root' })
export class CajasApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  listarPorSucursal(sucursalId: number) {
    return this.http.get<CajaDto[]>(`${this.base}/api/v1/cajas`, {
      params: { sucursalId: String(sucursalId) },
    });
  }

  crear(sucursalId: number, body: Partial<CajaDto>) {
    return this.http.post<CajaDto>(`${this.base}/api/v1/cajas`, body, {
      params: { sucursalId: String(sucursalId) },
    });
  }
}
