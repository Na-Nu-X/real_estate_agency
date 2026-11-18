import { PropertyCondition, PropertyOrdering, PropertyType, TransactionType } from './property.model';

export interface Option<T> {
  value: T;
  label: string;
}

export const TRANSACTION_OPTIONS: Option<TransactionType>[] = [
  { value: 'predaj', label: 'Predaj' },
  { value: 'prenajom', label: 'Prenájom' },
];

export const PROPERTY_TYPE_OPTIONS: Option<PropertyType>[] = [
  { value: 'byt', label: 'Byty' },
  { value: 'dom', label: 'Domy' },
  { value: 'pozemok', label: 'Pozemky' },
  { value: 'komercne', label: 'Komerčné' },
];

export const PROPERTY_TYPE_SINGULAR: Record<PropertyType, string> = {
  byt: 'Byt',
  dom: 'Dom',
  pozemok: 'Pozemok',
  komercne: 'Komerčný priestor',
};

export const CONDITION_OPTIONS: Option<PropertyCondition>[] = [
  { value: 'novostavba', label: 'Novostavba' },
  { value: 'kompletna_rekonstrukcia', label: 'Kompletná rekonštrukcia' },
  { value: 'ciastocna_rekonstrukcia', label: 'Čiastočná rekonštrukcia' },
  { value: 'povodny_stav', label: 'Pôvodný stav' },
  { value: 'vo_vystavbe', label: 'Vo výstavbe' },
];

export const ROOM_OPTIONS: Option<number>[] = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5+' },
];

export const ORDERING_OPTIONS: Option<PropertyOrdering>[] = [
  { value: '-created_at', label: 'Najnovšie' },
  { value: 'price', label: 'Cena: od najnižšej' },
  { value: '-price', label: 'Cena: od najvyššej' },
];

export const PRICE_PRESETS: Option<number>[] = [
  { value: 150000, label: 'do 150 000 €' },
  { value: 300000, label: 'do 300 000 €' },
  { value: 500000, label: 'do 500 000 €' },
  { value: 1000000, label: 'do 1 000 000 €' },
  { value: 2000000, label: 'do 2 000 000 €' },
];
