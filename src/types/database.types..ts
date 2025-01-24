import { Categories } from './categories.types';
import { Products, ProductsInsert } from './products.types.';

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: Categories;
      };
      products: {
        Row: Products;
        Insert: ProductsInsert;
      };
    };
  };
}
