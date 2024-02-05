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

export type Payment = 'CB' | 'CH' | 'ES' | 'LI';
export const PAYMENT_METHODS = {
  CB: 'Carte bancaire',
  CH: 'Chèque',
  ES: 'Espèces',
  LI: 'LyfPay',
};
