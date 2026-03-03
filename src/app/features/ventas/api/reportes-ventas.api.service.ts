import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReportesVentasApiService {
  private base = `${environment.apiUrl}/api/v1/reportes/ventas`;
  constructor(private http: HttpClient) {}

  // Helper: abrir blob en nueva pestaña
  openPdf(blob: Blob) {
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  diario(fecha: string) {
    const params = new HttpParams().set('fecha', fecha);
    return this.http.get(`${this.base}/diario`, { params, responseType: 'blob' });
  }

  mensual(anio: number, mes: number) {
    const params = new HttpParams().set('anio', String(anio)).set('mes', String(mes));
    return this.http.get(`${this.base}/mensual`, { params, responseType: 'blob' });
  }

  anual(anio: number) {
    const params = new HttpParams().set('anio', String(anio));
    return this.http.get(`${this.base}/anual`, { params, responseType: 'blob' });
  }
}
