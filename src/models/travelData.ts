export const TRANSPORTATION_METHOD = {
  BIKE: 'BIKE',
  BUS: 'BUS',
  BOAT: 'BOAT',
  CAR: 'CAR',
  CARPOOLING: 'CARPOOLING',
  NONE: 'NONE',
  PLANE: 'PLANE',
  PUBLIC_TRANSPORT: 'PUBLIC_TRANSPORT',
  TRAIN: 'TRAIN',
} as const;

type ValueOf<T> = T[keyof T];
export type TransportationMethod = ValueOf<typeof TRANSPORTATION_METHOD>;

export const TRANSPORTATION_METHOD_TO_STRING = {
  BIKE: 'Vélo',
  BUS: 'Bus',
  BOAT: 'Bateau',
  CAR: 'Voiture',
  CARPOOLING: 'Covoiturage',
  NONE: 'Aucun',
  PLANE: 'Avion',
  PUBLIC_TRANSPORT: 'Transport en commun',
  TRAIN: 'Train',
} satisfies Record<TransportationMethod, string>;

export type TravelData = {
  city: string;
  transportation_method: TransportationMethod;
  event: number;
};
