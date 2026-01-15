import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { DepositoDto, MovimientoStockCreateRequest, MovimientoStockDto } from './movimientos-stock.model';

@Injectable({ providedIn: 'root' })
export class MovimientosStockApi {
  private base = `${environment.apiUrl}/api/v1`;

  constructor(private http: HttpClient) {}

  listDepositos() {
    return this.http.get<DepositoDto[]>(`${this.base}/depositos`);
  }

  crearEntrada(depositoId: number, productoId: number, cantidad: number) {
    const req: MovimientoStockCreateRequest = {
      tipo: 'ENTRADA',
      fecha: new Date().toISOString(),
      referenciaTipo: 'AJUSTE',
      items: [{ depositoId, productoId, cantidad }],
    };
    return this.http.post<MovimientoStockDto>(`${this.base}/movimientos-stock`, req);
  }
}
