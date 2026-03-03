import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';

export type ItemTipo = 'PRODUCTO' | 'SERVICIO';

export interface PresupuestoItemDto {
  tipo: ItemTipo;
  productoId?: number;
  servicioId?: number;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  /** Solo para UI (NO se envía al backend) */
  totalLinea: number;
}

export interface PresupuestoDto {
  id: number;
  clienteId: number;
  clienteNombre?: string | null;
  fecha: string;
  estado: string;
  total: number;
  observacion?: string | null;
}

export interface CreatePresupuestoDto {
  clienteId: number;
  observacion?: string | null;
  items: PresupuestoItemDto[];
}

/** Item EXACTO como PresupuestoRequest.Item del backend */
export interface PresupuestoItemRequest {
  tipo: ItemTipo;
  productoId?: number;
  servicioId?: number;
  descripcion?: string | null;
  cantidad: number;
  precioUnitario: number;
}

export interface CreatePresupuestoRequest {
  clienteId: number;
  observacion?: string | null;
  items: PresupuestoItemRequest[];
}

@Injectable({ providedIn: 'root' })
export class PresupuestosApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;
  private url = `${this.base}/api/v1/presupuestos`;

  listar() {
    return this.http.get<PresupuestoDto[]>(this.url);
  }

  crear(body: CreatePresupuestoDto) {
    // ⚠️ El backend (Spring/Jackson) puede rechazar propiedades extra (ej: totalLinea).
    // Enviamos un request limpio con solo los campos esperados.
    const req: CreatePresupuestoRequest = {
      clienteId: body.clienteId,
      observacion: body.observacion ?? null,
      items: body.items.map((it) => ({
        tipo: it.tipo,
        productoId: it.productoId,
        servicioId: it.servicioId,
        descripcion: it.descripcion,
        cantidad: Number(it.cantidad),
        precioUnitario: Number(it.precioUnitario),
      })),
    };
    return this.http.post<PresupuestoDto>(this.url, req);
  }
}
