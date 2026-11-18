import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, Params, Router, RouterLink } from '@angular/router';
import { BehaviorSubject, combineLatest, map, switchMap } from 'rxjs';

import { SITE_CONFIG } from '../../core/config/site.config';
import {
  ORDERING_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  ROOM_OPTIONS,
  TRANSACTION_OPTIONS,
} from '../../core/models/options';
import {
  PropertyFilters,
  PropertyListItem,
  PropertyOrdering,
  PropertyType,
  TransactionType,
} from '../../core/models/property.model';
import { PropertyService } from '../../core/services/property.service';
import { formatEur, pluralize } from '../../core/utils/format';
import { LoadState, toLoadState } from '../../core/utils/load-state';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { PropertyCardComponent } from '../../shared/components/property-card/property-card.component';

type ViewMode = 'grid' | 'list';
type NumericKey = 'min_price' | 'max_price' | 'min_area' | 'max_area';

interface ActiveChip {
  label: string;
  clear: Params;
}

const VIEW_STORAGE_KEY = 'catalog-view';

function pickOption<T extends string>(value: string | null, allowed: readonly { value: T }[]): T | null {
  return allowed.some((o) => o.value === value) ? (value as T) : null;
}

function positiveNumber(value: string | null): number | null {
  if (value === null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/** Parses and sanitises URL query params into API filters. */
export function parseFilters(params: ParamMap): PropertyFilters {
  return {
    transaction: pickOption<TransactionType>(params.get('transaction'), TRANSACTION_OPTIONS),
    property_type: pickOption<PropertyType>(params.get('property_type'), PROPERTY_TYPE_OPTIONS),
    city: params.get('city')?.trim() || null,
    min_price: positiveNumber(params.get('min_price')),
    max_price: positiveNumber(params.get('max_price')),
    min_area: positiveNumber(params.get('min_area')),
    max_area: positiveNumber(params.get('max_area')),
    rooms: positiveNumber(params.get('rooms')),
    featured: params.get('featured') === 'true' ? true : null,
    ordering: pickOption<PropertyOrdering>(params.get('ordering'), ORDERING_OPTIONS),
  };
}

@Component({
  selector: 'app-catalog',
  imports: [RouterLink, IconComponent, PropertyCardComponent],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'filtersOpen.set(false)',
  },
})
export class CatalogComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(PropertyService);
  private readonly document = inject(DOCUMENT);

  protected readonly transactionOptions = TRANSACTION_OPTIONS;
  protected readonly typeOptions = PROPERTY_TYPE_OPTIONS;
  protected readonly roomOptions = ROOM_OPTIONS;
  protected readonly orderingOptions = ORDERING_OPTIONS;
  protected readonly skeletons = Array.from({ length: 6 }, (_, i) => i);

  /** Current filters – the URL is the single source of truth. */
  protected readonly filters = toSignal(this.route.queryParamMap.pipe(map(parseFilters)), {
    initialValue: parseFilters(this.route.snapshot.queryParamMap),
  });

  private readonly reload$ = new BehaviorSubject<void>(undefined);

  protected readonly results = toSignal(
    combineLatest([this.route.queryParamMap, this.reload$]).pipe(
      map(([params]) => parseFilters(params)),
      switchMap((f) => toLoadState(this.api.list(f))),
    ),
    { initialValue: { status: 'loading' } as LoadState<PropertyListItem[]> },
  );

  protected readonly view = signal<ViewMode>(this.readStoredView());
  protected readonly filtersOpen = signal(false);

  protected readonly cityOptions = computed(() => {
    const city = this.filters().city;
    const list = [...SITE_CONFIG.searchLocations];
    return city && !list.includes(city) ? [...list, city] : list;
  });

  protected readonly count = computed(() => {
    const r = this.results();
    return r.status === 'success' ? r.data.length : null;
  });

  protected readonly countLabel = computed(() => {
    const n = this.count();
    if (n === null) return 'Načítavam ponuku…';
    return `${n} ${pluralize(n, 'nehnuteľnosť', 'nehnuteľnosti', 'nehnuteľností')}`;
  });

  protected readonly heading = computed(() => {
    const f = this.filters();
    const typeLabel = PROPERTY_TYPE_OPTIONS.find((o) => o.value === f.property_type)?.label ?? 'Nehnuteľnosti';
    const suffix = f.transaction === 'predaj' ? ' na predaj' : f.transaction === 'prenajom' ? ' na prenájom' : '';
    return `${typeLabel}${suffix}${f.city ? ` · ${f.city}` : ''}`;
  });

  protected readonly activeChips = computed<ActiveChip[]>(() => {
    const f = this.filters();
    const chips: ActiveChip[] = [];
    if (f.transaction) {
      chips.push({ label: TRANSACTION_OPTIONS.find((o) => o.value === f.transaction)!.label, clear: { transaction: null } });
    }
    if (f.property_type) {
      chips.push({ label: PROPERTY_TYPE_OPTIONS.find((o) => o.value === f.property_type)!.label, clear: { property_type: null } });
    }
    if (f.city) chips.push({ label: f.city, clear: { city: null } });
    if (f.min_price !== null && f.min_price !== undefined) chips.push({ label: `od ${formatEur(f.min_price)}`, clear: { min_price: null } });
    if (f.max_price !== null && f.max_price !== undefined) chips.push({ label: `do ${formatEur(f.max_price)}`, clear: { max_price: null } });
    if (f.min_area !== null && f.min_area !== undefined) chips.push({ label: `od ${f.min_area} m²`, clear: { min_area: null } });
    if (f.max_area !== null && f.max_area !== undefined) chips.push({ label: `do ${f.max_area} m²`, clear: { max_area: null } });
    if (f.rooms) chips.push({ label: f.rooms >= 5 ? '5+ izieb' : `${f.rooms}-izbové`, clear: { rooms: null } });
    if (f.featured) chips.push({ label: 'Exkluzívne', clear: { featured: null } });
    return chips;
  });

  constructor() {
    effect(() => {
      this.document.body.classList.toggle('no-scroll', this.filtersOpen());
    });
    effect(() => {
      try {
        localStorage.setItem(VIEW_STORAGE_KEY, this.view());
      } catch {
        /* storage unavailable – ignore */
      }
    });
  }

  // ------------------------------------------------------------ URL updates
  protected updateParams(patch: Params): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: patch,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  protected toggleParam(key: keyof PropertyFilters, value: string | number | boolean): void {
    const current = this.filters()[key];
    this.updateParams({ [key]: current === value ? null : value });
  }

  protected setSelect(key: keyof PropertyFilters, event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.updateParams({ [key]: value || null });
  }

  protected setNumber(key: NumericKey, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value === '' ? null : Math.max(0, Math.round(Number(input.value)));
    this.updateParams({ [key]: value === null || Number.isNaN(value) ? null : value });
  }

  protected resetFilters(): void {
    const ordering = this.filters().ordering;
    this.router.navigate([], { relativeTo: this.route, queryParams: ordering ? { ordering } : {}, replaceUrl: true });
  }

  protected retry(): void {
    this.reload$.next();
  }

  protected setView(mode: ViewMode): void {
    this.view.set(mode);
  }

  private readStoredView(): ViewMode {
    try {
      return localStorage.getItem(VIEW_STORAGE_KEY) === 'list' ? 'list' : 'grid';
    } catch {
      return 'grid';
    }
  }
}
