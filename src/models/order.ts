import type { Timeslot } from '@/models/timeslot';

export interface BaseOrder {
  id: number;
  user: string;
  pizza: number[];
  payment_method: Payment;
  price: number;
  paid: boolean;
  created_at: Date;
  delivered: boolean;
  delivery_date: Date;
}

export interface Order extends BaseOrder {
  timeslot: number;
}

export interface OrderDeref extends BaseOrder {
  timeslot: Timeslot;
}

export const PAYMENT_METHODS = ['CB', 'CH', 'ES', 'LI', 'FR'] as const;
export type Payment = typeof PAYMENT_METHODS[number];
