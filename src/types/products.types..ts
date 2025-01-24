export interface Products {
  id: number;
  created_at: string;
  name: string;
  seller_id: number;
  description: string;
  starting_price: number;
  current_price: number;
  closing_at: string;
}

export interface ProductsInsert {
  id?: never;
  created_at?: never;
  name: string;
  seller_id: number;
  description?: string;
  starting_price: number;
  current_price: number;
  closing_at: string;
}
