export type TransactionType = 'predaj' | 'prenajom';
export type PropertyType = 'byt' | 'dom' | 'pozemok' | 'komercne';
export type PropertyBadge = 'exkluzivne' | 'novinka' | 'znizena_cena' | 'rezervovane' | 'predane' | 'none';
export type PropertyCondition =
  | 'novostavba'
  | 'kompletna_rekonstrukcia'
  | 'ciastocna_rekonstrukcia'
  | 'povodny_stav'
  | 'vo_vystavbe'
  | 'neuvedene';
export type EnergyClass = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

export interface AgentSummary {
  id: number;
  full_name: string;
  role: string;
  phone: string;
  email: string;
  photo_url: string;
}

export interface Agent extends AgentSummary {
  bio: string;
  display_order: number;
  active_listings_count: number;
}

export interface PropertyImage {
  id: number;
  image_url: string;
  caption: string;
  display_order: number;
}

export interface PropertyListItem {
  id: number;
  title: string;
  slug: string;
  transaction: TransactionType;
  transaction_display: string;
  property_type: PropertyType;
  property_type_display: string;
  price: number;
  city: string;
  district: string;
  floor_area: number;
  land_area: number | null;
  rooms: number;
  floor: number | null;
  condition: PropertyCondition;
  condition_display: string;
  energy_class: EnergyClass;
  badge: PropertyBadge;
  badge_display: string;
  cover_image_url: string;
  is_featured: boolean;
  agent: number | null;
  created_at: string;
}

export interface PropertyDetail extends Omit<PropertyListItem, 'agent'> {
  description: string;
  amenities: string[];
  images: PropertyImage[];
  agent: AgentSummary | null;
}

export type PropertyOrdering = '-created_at' | 'price' | '-price';

export interface PropertyFilters {
  transaction?: TransactionType | null;
  property_type?: PropertyType | null;
  city?: string | null;
  min_price?: number | null;
  max_price?: number | null;
  min_area?: number | null;
  max_area?: number | null;
  rooms?: number | null;
  featured?: boolean | null;
  agent?: number | null;
  ordering?: PropertyOrdering | null;
}
