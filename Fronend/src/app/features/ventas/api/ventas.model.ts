export interface ClienteDto {
  id: number;
  nombreRazonSocial: string;
  ruc?: string;
  telefono?: string;
}

export interface ProductoDto {
  id: number;
  sku: string;
  descripcion: string;
  precio: number;
}

/** EstadoVenta (backend enum) */
export type EstadoVenta = 'BORRADOR' | 'CONFIRMADA' | 'ANULADA' | string;

/** TipoItem (backend enum) */
export type TipoItem = 'PRODUCTO' | 'SERVICIO';

/** MedioPago (si ya lo tenés en backend, podés ajustar los valores) */
export type MedioPago = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | string;

export interface VentaItemDraft {
  // Draft que usás en UI (carrito)
  productoId: number;
  sku?: string;
  descripcion?: string;
  precioUnitario: number;
  cantidad: number;

  // si luego agregás servicio:
  // tipo?: TipoItem;
  // servicioId?: number;
  // depositoId?: number;
}

/** Request item EXACTO como VentaRequest.Item del backend */
export interface VentaRequestItem {
  tipo: TipoItem;

  // PRODUCTO
  productoId?: number | null;
  depositoId?: number | null;

  // SERVICIO
  servicioId?: number | null;

  descripcion?: string | null;
  cantidad: number;
  precioUnitario: number;
}

/** Cobro item (backend VentaRequest.CobroItem) */
export interface VentaCobroItemRequest {
  medioPago: MedioPago;
  monto: number;
}

/** VentaRequest del backend */
export interface VentaRequest {
  cajaId: number;
  clienteId: number;
  observacion?: string | null;
  items: VentaRequestItem[];
  cobros?: VentaCobroItemRequest[];
}

export interface VentaDto {
  id: number;
  fecha: string;          // OffsetDateTime -> ISO string
  estado: EstadoVenta;
  clienteId: number;
  clienteNombre?: string | null;
  total: number;
}

/** FacturaResponse */
export interface FacturaResponse {
  id: number;
  tipo: 'NO_FISCAL' | 'FISCAL' | string;
}
