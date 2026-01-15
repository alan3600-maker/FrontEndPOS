import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FacturaResponse, VentaDto, VentaRequest } from './ventas.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class VentasApi {
  private base = `${environment.apiUrl}/api/v1`;
  constructor(private http: HttpClient) {}

  // Setear items (ajustá si tu backend usa otro endpoint)
  setItems(ventaId: number, req: VentaRequest) {
    return this.updateVenta(ventaId, req);
  }

  // Helper: abrir blob en nueva pestaña
  openPdf(blob: Blob) {
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

createVenta(req: VentaRequest) {
  return this.http.post<VentaDto>(`${this.base}/ventas`, req);
}

updateVenta(ventaId: number, req: VentaRequest) {
  return this.http.put<VentaDto>(`${this.base}/ventas/${ventaId}`, req);
}

confirmar(ventaId: number, cajaId: number) {
  // Backend: POST /ventas/{id}/confirmar?cajaId=...
  return this.http.post<VentaDto>(`${this.base}/ventas/${ventaId}/confirmar?cajaId=${cajaId}`, {});
}

  // ✅ Emitir NO FISCAL desde venta (según tu FacturaController)
  emitirNoFiscal(ventaId: number) {
    return this.http.post<FacturaResponse>(
      `${this.base}/facturas/emitir-desde-venta/${ventaId}`,
      { tipo: 'NO_FISCAL' } // FacturaEmitirDesdeVentaRequest
    );
  }

  // ✅ PDF ticket
  pdfTicket(facturaId: number) {
    return this.http.get(`${this.base}/facturas/${facturaId}/pdf?format=TICKET`, {
      responseType: 'blob',
    });
  }
}
