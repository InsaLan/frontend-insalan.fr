export enum PartnerType {
  PARTNER = 'PA',
  SPONSOR = 'SP',
}

export interface Partner {
  id: number;
  name: string;
  url: string;
  partner_type: PartnerType;
  logo?: string;
}
