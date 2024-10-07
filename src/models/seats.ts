export interface Seat {
  id: number;
  x: number;
  y: number;
  event: number;
}

export interface SeatSlot {
  id: number;
  tournament: number;
  seats: Seat[];
}
