export type TipoMovimientoStock = 'ENTRADA' | 'SALIDA';

export interface DepositoDto {
  id: number;
  nombre: string;
}

export interface MovimientoStockCreateRequest {
  tipo: TipoMovimientoStock;
  fecha?: string;
  referenciaTipo?: string;
  referenciaId?: number;
  items: {
    productoId: number;
    depositoId: number;
    cantidad: number;
  }[];
}

export interface MovimientoStockDto {
  id: number;
  tipo: TipoMovimientoStock;
  fecha: string;
  depositoId?: number | null;
  depositoNombre?: string | null;
  totalItems: number;
}
