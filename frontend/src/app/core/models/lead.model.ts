import { PropertyCondition, PropertyType } from './property.model';

export interface ViewingInquiryPayload {
  property: string; // property slug
  client_name: string;
  email: string;
  phone: string;
  preferred_datetime: string | null;
  message: string;
}

export interface ValuationRequestPayload {
  property_type: PropertyType;
  location: string;
  floor_area: number;
  rooms: number;
  condition: PropertyCondition;
  owner_name: string;
  phone: string;
  email: string;
  notes: string;
}

export interface ContactMessagePayload {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

/** DRF validation error body: `{ field: ["message", ...] }` */
export type ApiFieldErrors = Record<string, string[]>;
