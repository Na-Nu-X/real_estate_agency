/**
 * WHITE-LABEL CONFIGURATION
 * -------------------------------------------------------------------------
 * Everything that identifies the agency lives here. To rebrand the site for a
 * new client, edit this file (and optionally the `theme` colours below) –
 * no component code needs to change.
 */

export interface SiteMetric {
  value: string;
  label: string;
}

export interface Testimonial {
  quote: string;
  author: string;
  context: string;
}

export interface ValueProposition {
  title: string;
  text: string;
}

export interface OfficeHours {
  days: string;
  hours: string;
}

export interface SiteConfig {
  name: string;
  logoText: string;
  logoTagline: string;
  /** Short claim used in the footer and meta description. */
  claim: string;
  phone: string;
  email: string;
  address: {
    street: string;
    zip: string;
    city: string;
    country: string;
    /** Used for the map on the contact page. */
    lat: number;
    lng: number;
  };
  company: {
    legalName: string;
    ico: string;
    dic: string;
    icDph: string;
    iban: string;
    registry: string;
  };
  social: { label: string; url: string; icon: 'instagram' | 'facebook' | 'linkedin' | 'youtube' }[];
  officeHours: OfficeHours[];
  metrics: SiteMetric[];
  valuePropositions: ValueProposition[];
  testimonials: Testimonial[];
  /** Locations offered in the quick search and catalogue filter. */
  searchLocations: string[];
  /** Hero photography. */
  images: {
    hero: string;
    valuation: string;
    about: string;
    sell: string;
  };
  /** Optional runtime overrides of CSS custom properties (see styles/_base.scss). */
  theme: Partial<Record<
    | '--color-bg'
    | '--color-surface'
    | '--color-text'
    | '--color-text-muted'
    | '--color-accent'
    | '--color-accent-hover'
    | '--color-brass'
    | '--font-serif'
    | '--font-sans',
    string
  >>;
}

export const SITE_CONFIG: SiteConfig = {
  name: 'Meridian Reality',
  logoText: 'Meridian',
  logoTagline: 'Reality & Rezidencie',
  claim: 'Prémiové nehnuteľnosti na Slovensku. Diskrétne, osobne a s dôrazom na detail.',
  phone: '+421 2 2045 8800',
  email: 'info@reality-example.sk',
  address: {
    street: 'Panenská 12',
    zip: '811 03',
    city: 'Bratislava',
    country: 'Slovenská republika',
    lat: 48.1468,
    lng: 17.1033,
  },
  company: {
    legalName: 'Meridian Reality s.r.o.',
    ico: '12 345 678',
    dic: '2023456789',
    icDph: 'SK2023456789',
    iban: 'SK31 1100 0000 0029 4512 3456',
    registry: 'Zapísaná v Obchodnom registri Mestského súdu Bratislava III, oddiel Sro, vložka č. 123456/B',
  },
  social: [
    { label: 'Instagram', url: 'https://www.instagram.com/', icon: 'instagram' },
    { label: 'Facebook', url: 'https://www.facebook.com/', icon: 'facebook' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/', icon: 'linkedin' },
  ],
  officeHours: [
    { days: 'Pondelok – Piatok', hours: '9:00 – 18:00' },
    { days: 'Sobota', hours: '10:00 – 14:00 (po dohode)' },
    { days: 'Nedeľa', hours: 'Zatvorené' },
  ],
  metrics: [
    { value: '18', label: 'rokov na realitnom trhu' },
    { value: '1 250+', label: 'úspešne predaných nehnuteľností' },
    { value: '420 mil. €', label: 'celkový objem transakcií' },
    { value: '98 %', label: 'spokojných klientov' },
  ],
  valuePropositions: [
    {
      title: 'Presné ocenenie',
      text: 'Cenu stanovujeme na základe reálnych transakčných dát, nie odhadov z inzertných portálov.',
    },
    {
      title: 'Prémiová prezentácia',
      text: 'Architektonická fotografia, video z dronu a 3D prehliadka sú súčasťou každej exkluzívnej zákazky.',
    },
    {
      title: 'Overení kupujúci',
      text: 'Pracujeme s databázou viac ako 3 800 preverených záujemcov vrátane zahraničných investorov.',
    },
    {
      title: 'Právna istota',
      text: 'Zmluvy pripravuje naša advokátska kancelária a kúpnu cenu chráni notárska alebo banková úschova.',
    },
  ],
  testimonials: [
    {
      quote:
        'Byt na Panenskej sme predali za 24 dní a o 6 % nad pôvodným odhadom. Profesionalita, s akou tím pristupoval ku každému detailu, nás úprimne prekvapila.',
      author: 'Andrea a Tomáš K.',
      context: 'Predaj 4-izbového bytu, Staré Mesto',
    },
    {
      quote:
        'Z Viedne sme hľadali dom na Kolibe. Maklér nám pripravil videoobhliadky, preveril právny stav a celý proces zvládol tak, že sme do Bratislavy museli prísť len dvakrát.',
      author: 'Michael S.',
      context: 'Kúpa rodinného domu, Koliba',
    },
    {
      quote:
        'Oceňujem diskrétnosť. Chatu v Tatrách sme predali bez verejnej inzercie priamo klientovi z ich databázy. Rýchlo, ticho a za férovú cenu.',
      author: 'Ing. Jana M.',
      context: 'Off-market predaj, Vysoké Tatry',
    },
  ],
  searchLocations: ['Bratislava', 'Košice', 'Žilina', 'Vysoké Tatry'],
  images: {
    hero: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1800&q=80',
    valuation: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
    about: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80',
    sell: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=80',
  },
  theme: {
    // Example: '--color-accent': '#0F3B5F', '--color-accent-hover': '#0A2A44',
  },
};
