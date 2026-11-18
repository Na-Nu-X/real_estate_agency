import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SITE_CONFIG } from '../../core/config/site.config';

@Component({
  selector: 'app-privacy',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="page-head">
      <div class="container-narrow">
        <nav class="breadcrumb" aria-label="Omrvinková navigácia">
          <a routerLink="/">Domov</a>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Ochrana osobných údajov</span>
        </nav>
        <span class="eyebrow eyebrow--ruled">GDPR</span>
        <h1>Ochrana osobných údajov</h1>
      </div>
    </header>

    <article class="section container-narrow prose">
      <p class="lead">
        Prevádzkovateľom osobných údajov je {{ site.company.legalName }}, so sídlom {{ site.address.street }},
        {{ site.address.zip }} {{ site.address.city }}, IČO: {{ site.company.ico }} („prevádzkovateľ“).
      </p>

      <h2 class="h3">Aké údaje spracúvame</h2>
      <p>
        Prostredníctvom formulárov na tejto webovej stránke spracúvame meno a priezvisko, e-mailovú adresu, telefónne
        číslo, údaje o nehnuteľnosti a obsah vašej správy.
      </p>

      <h2 class="h3">Účel a právny základ</h2>
      <p>
        Údaje spracúvame výlučne na účel vybavenia vašej žiadosti (dohodnutie obhliadky, vypracovanie odhadu ceny,
        odpoveď na otázku) na základe vášho súhlasu podľa čl. 6 ods. 1 písm. a) a opatrení pred uzatvorením zmluvy
        podľa čl. 6 ods. 1 písm. b) Nariadenia (EÚ) 2016/679 (GDPR) a zákona č. 18/2018 Z. z.
      </p>

      <h2 class="h3">Doba uchovávania</h2>
      <p>
        Osobné údaje uchovávame po dobu nevyhnutnú na vybavenie žiadosti, najdlhšie 24 mesiacov, pokiaľ osobitný
        predpis nevyžaduje dlhšiu lehotu.
      </p>

      <h2 class="h3">Vaše práva</h2>
      <p>
        Máte právo na prístup k údajom, ich opravu, vymazanie, obmedzenie spracúvania, prenosnosť, právo namietať
        a kedykoľvek odvolať súhlas. Máte tiež právo podať sťažnosť Úradu na ochranu osobných údajov SR.
      </p>

      <h2 class="h3">Kontakt</h2>
      <p>
        Svoje práva si môžete uplatniť e-mailom na <a class="link" [href]="'mailto:' + site.email">{{ site.email }}</a>
        alebo písomne na adrese sídla prevádzkovateľa.
      </p>
    </article>
  `,
  styles: `
    .prose {
      max-width: 46rem;
    }
    .prose h2 {
      margin: 2.5rem 0 0.75rem;
    }
    .prose p {
      color: var(--color-text-muted);
    }
    .prose .lead {
      color: var(--color-text);
    }
  `,
})
export class PrivacyComponent {
  protected readonly site = SITE_CONFIG;
}
