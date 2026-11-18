import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { map, of, switchMap } from 'rxjs';

import { SITE_CONFIG } from '../../core/config/site.config';
import { PropertyDetail, PropertyListItem } from '../../core/models/property.model';
import { PropertyService } from '../../core/services/property.service';
import { formatEur, formatFloor, formatNumber, formatRooms } from '../../core/utils/format';
import { LoadState, toLoadState } from '../../core/utils/load-state';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { IconName } from '../../shared/components/icon/icons';
import { MortgageCalculatorComponent } from '../../shared/components/mortgage-calculator/mortgage-calculator.component';
import { PropertyCardComponent } from '../../shared/components/property-card/property-card.component';
import { AreaPipe, EurPipe } from '../../shared/pipes/format.pipes';
import { PropertyGalleryComponent } from './property-gallery.component';
import { ViewingFormComponent } from './viewing-form.component';

interface KeyFact {
  icon: IconName;
  label: string;
  value: string;
}

@Component({
  selector: 'app-property-detail',
  imports: [
    RouterLink,
    IconComponent,
    EurPipe,
    AreaPipe,
    PropertyGalleryComponent,
    ViewingFormComponent,
    MortgageCalculatorComponent,
    PropertyCardComponent,
  ],
  templateUrl: './property-detail.component.html',
  styleUrl: './property-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyDetailComponent {
  /** Bound from the `:slug` route param (withComponentInputBinding). */
  readonly slug = input.required<string>();

  private readonly api = inject(PropertyService);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  protected readonly state = toSignal(
    toObservable(this.slug).pipe(switchMap((slug) => toLoadState(this.api.get(slug)))),
    { initialValue: { status: 'loading' } as LoadState<PropertyDetail> },
  );

  protected readonly property = computed(() => {
    const s = this.state();
    return s.status === 'success' ? s.data : null;
  });

  protected readonly similar = toSignal(
    toObservable(this.property).pipe(
      switchMap((p) =>
        p
          ? this.api
              .list({ property_type: p.property_type, transaction: p.transaction })
              .pipe(map((list) => list.filter((x) => x.id !== p.id && x.badge !== 'predane').slice(0, 3)))
          : of([] as PropertyListItem[]),
      ),
    ),
    { initialValue: [] as PropertyListItem[] },
  );

  protected readonly paragraphs = computed(() =>
    (this.property()?.description ?? '').split(/\n{2,}/).map((p) => p.trim()).filter(Boolean),
  );

  protected readonly gallery = computed(() => {
    const p = this.property();
    if (!p) return [];
    return p.images.length ? p.images : [{ id: 0, image_url: p.cover_image_url, caption: '', display_order: 0 }];
  });

  protected readonly pricePerSqm = computed(() => {
    const p = this.property();
    if (!p || p.transaction !== 'predaj') return null;
    const area = p.property_type === 'pozemok' ? p.land_area : p.floor_area;
    return area ? Math.round(p.price / area) : null;
  });

  protected readonly keyFacts = computed<KeyFact[]>(() => {
    const p = this.property();
    if (!p) return [];
    const facts: KeyFact[] = [];
    if (p.floor_area > 0) facts.push({ icon: 'area', label: 'Úžitková plocha', value: `${formatNumber(p.floor_area)} m²` });
    if (p.land_area) facts.push({ icon: 'land', label: 'Pozemok', value: `${formatNumber(p.land_area)} m²` });
    if (p.rooms > 0) facts.push({ icon: 'rooms', label: 'Dispozícia', value: formatRooms(p.rooms) });
    if (p.floor !== null) facts.push({ icon: 'floor', label: 'Podlažie', value: formatFloor(p.floor) });
    if (p.property_type !== 'pozemok') facts.push({ icon: 'energy', label: 'Energetická trieda', value: p.energy_class });
    return facts.slice(0, 4);
  });

  protected readonly specs = computed(() => {
    const p = this.property();
    if (!p) return [];
    const rows: [string, string][] = [
      ['Typ nehnuteľnosti', p.property_type_display],
      ['Transakcia', p.transaction_display],
      ['Lokalita', p.district ? `${p.city}, ${p.district}` : p.city],
      ['Cena', formatEur(p.price) + (p.transaction === 'prenajom' ? ' / mesiac' : '')],
    ];
    if (p.floor_area > 0) rows.push(['Úžitková plocha', `${formatNumber(p.floor_area)} m²`]);
    if (p.land_area) rows.push(['Plocha pozemku', `${formatNumber(p.land_area)} m²`]);
    if (p.rooms > 0) rows.push(['Počet izieb', String(p.rooms)]);
    if (p.floor !== null) rows.push(['Podlažie', formatFloor(p.floor)]);
    if (p.condition !== 'neuvedene') rows.push(['Stav', p.condition_display]);
    if (p.property_type !== 'pozemok') rows.push(['Energetický certifikát', `Trieda ${p.energy_class}`]);
    rows.push(['Číslo ponuky', `MR-${String(p.id).padStart(4, '0')}`]);
    return rows;
  });

  protected readonly isAvailable = computed(() => this.property()?.badge !== 'predane');

  protected readonly agentPhoneHref = computed(() => {
    const phone = this.property()?.agent?.phone ?? SITE_CONFIG.phone;
    return `tel:${phone.replace(/\s+/g, '')}`;
  });

  protected readonly mailHref = computed(() => {
    const p = this.property();
    return p?.agent ? `mailto:${p.agent.email}?subject=${encodeURIComponent(p.title)}` : `mailto:${SITE_CONFIG.email}`;
  });

  private readonly document = inject(DOCUMENT);

  protected scrollToForm(): void {
    this.document.getElementById('obhliadka')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  constructor() {
    effect(() => {
      const p = this.property();
      if (!p) return;
      this.title.setTitle(`${p.title} – ${p.city} | ${SITE_CONFIG.name}`);
      this.meta.updateTag({
        name: 'description',
        content: `${p.title}, ${p.city}. ${formatEur(p.price)}. ${this.paragraphs()[0] ?? ''}`.slice(0, 160),
      });
    });
  }
}
