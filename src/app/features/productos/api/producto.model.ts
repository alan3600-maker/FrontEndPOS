export interface Producto {
  id: number;
  sku:string;
  descripcion: string;
  precio:number  
}

export type ProductoCreateUpdate = Partial<Omit<Producto, 'id'>> & {
  descripcion: string;
};

