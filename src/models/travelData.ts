export const TRANSPORTATION_METHOD = {
  BIKE: 'Vélo',
  BUS: 'Bus',
  BOAT: 'Bateau',
  CAR: 'Voiture',
  CARPOOLING: 'Covoiturage',
  NONE: 'Aucun',
  PLANE: 'Avion',
  PUBLIC_TRANSPORT: 'Transport en commun',
  TRAIN: 'Train',
};

export type TransportationMethod = keyof typeof TRANSPORTATION_METHOD;

export type TravelData = {
  city: string;
  transportation_method: TransportationMethod;
  event: number;
};
