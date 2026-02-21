import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
// Evitamos el import absoluto "src/..." porque puede no existir el path alias en tsconfig.
import { environment } from '../../../environments/environment';

export interface CajaTurnoDto {
  id: number;
  cajaId: number;
  estado: string; // ABIERTA | CERRADA
  fechaApertura?: string;
  fechaCierre?: string;
  montoInicial?: number;
  montoCierreDeclarado?: number;
}

@Injectable({ providedIn: 'root' })
export class CajaTurnosApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/v1/caja-turnos`;

  getAbierta(cajaId: number) {
    const params = new HttpParams().set('cajaId', String(cajaId));
    return this.http.get<CajaTurnoDto | null>(`${this.base}/abierta`, { params });
  }

  abrir(cajaId: number, montoInicial = 0) {
    let params = new HttpParams().set('cajaId', String(cajaId));
    params = params.set('montoInicial', String(montoInicial ?? 0));
    // El backend toma el usuario desde el token (usuarioAperturaId es opcional)
    return this.http.post<CajaTurnoDto>(`${this.base}/abrir`, null, { params });
  }
}
