// types.ts
export interface Order {
  id: number;
  total: number;
  status: string;
  created_at: string;
  payment_method: string;
}

export interface OrderItem {
  id: number;
  book_id: number;
  quantity: number;
  price: string;
  title?: string; // Tên sách
}