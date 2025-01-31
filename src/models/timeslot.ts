import type { Order } from '@/models/order';

export interface Timeslot {
  id: number;
  delivery_time: Date;
  start: Date;
  end: Date;
  pizza: number[];
  pizza_max: number;
  public: boolean;
  ended: boolean;
  player_price: number;
  staff_price: number;
  external_price: number;
}

export interface AdminTimeslot extends Timeslot {
  orders: number[];
}

export interface AdminTimeslotDeref extends Timeslot {
  orders: Order[];
}

export interface Export {
  id: number;
  orders: { [key: string]: number };
  created_at: string;
  time_slot: number;
}
