export interface Categories {
  id: number;
  created_at: string;
  category_name: string;
}

export interface CategoriesInsert {
  id?: never;
  created_at?: never;
  category_name: string;
}

export interface CategoriesUpdate {
  id?: never;
  created_at?: never;
  category_name: string;
}
