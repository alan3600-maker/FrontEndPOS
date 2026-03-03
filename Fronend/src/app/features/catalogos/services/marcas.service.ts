import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';

export interface MarcaDto {
  id: number;
  nombre: string;
  activo?: boolean;
}

@Injectable({ providedIn: 'root' })
export class MarcasApiService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/api/v1/marcas`;

  listar() {
    return this.http.get<MarcaDto[]>(`${this.url}`);
  }

  crear(body: Partial<MarcaDto>) {
    return this.http.post<MarcaDto>(`${this.url}`, body);
  }

  actualizar(id: number, body: Partial<MarcaDto>) {
    return this.http.put<MarcaDto>(`${this.url}/${id}`, body);
  }

  activar(id: number) {
    return this.http.post<MarcaDto>(`${this.url}/${id}/activar`, {});
  }

  desactivar(id: number) {
    return this.http.post<MarcaDto>(`${this.url}/${id}/desactivar`, {});
  }

  setActivo(id: number, activo: boolean) {
    return activo ? this.activar(id) : this.desactivar(id);
  }
}
