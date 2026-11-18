import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Prémiové nehnuteľnosti na Slovensku',
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'ponuka',
    title: 'Ponuka nehnuteľností',
    loadComponent: () => import('./pages/catalog/catalog.component').then((m) => m.CatalogComponent),
  },
  {
    path: 'ponuka/:slug',
    title: 'Detail nehnuteľnosti',
    loadComponent: () =>
      import('./pages/property-detail/property-detail.component').then((m) => m.PropertyDetailComponent),
  },
  {
    path: 'predaj',
    title: 'Chcem predať – bezplatný odhad ceny',
    loadComponent: () => import('./pages/sell/sell.component').then((m) => m.SellComponent),
  },
  {
    path: 'o-nas',
    title: 'O kancelárii a tím',
    loadComponent: () => import('./pages/about/about.component').then((m) => m.AboutComponent),
  },
  {
    path: 'kontakt',
    title: 'Kontakt',
    loadComponent: () => import('./pages/contact/contact.component').then((m) => m.ContactComponent),
  },
  {
    path: 'ochrana-osobnych-udajov',
    title: 'Ochrana osobných údajov',
    loadComponent: () => import('./pages/privacy/privacy.component').then((m) => m.PrivacyComponent),
  },
  {
    path: '**',
    title: 'Stránka nenájdená',
    loadComponent: () => import('./pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
