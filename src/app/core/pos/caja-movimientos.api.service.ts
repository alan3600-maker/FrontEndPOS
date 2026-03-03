import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';

export type TipoMovimientoCaja = 'INGRESO' | 'EGRESO';

export interface CajaMovimientoDto {
  id: number;
  turnoId: number;
  tipo: TipoMovimientoCaja;
  monto: number;
  motivo?: string;
  fecha?: string;
  usuarioId?: number;
  usuarioNombre?: string;
}

export interface CajaMovimientoRequest {
  turnoId: number;
  tipo: TipoMovimientoCaja;
  monto: number;
  motivo?: string;
}

@Injectable({ providedIn: 'root' })
export class CajaMovimientosApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/v1/caja-movimientos`;

  listar(turnoId: number) {
    const params = new HttpParams().set('turnoId', String(turnoId));
    return this.http.get<CajaMovimientoDto[]>(this.base, { params });
  }

  crear(req: CajaMovimientoRequest) {
    return this.http.post<CajaMovimientoDto>(this.base, req);
  }

  eliminar(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
