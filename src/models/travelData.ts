export const TRANSPORTATION_METHOD = [
  'BIKE',
  'BUS',
  'BOAT',
  'CAR',
  'CARPOOLING',
  'NONE',
  'PLANE',
  'PUBLIC_TRANSPORT',
  'TRAIN',
] as const;

export type TransportationMethod = typeof TRANSPORTATION_METHOD[number];

export type TravelData = {
  tournament: number;
  city: string;
  transportation_method: TransportationMethod;
  event: number;
};
