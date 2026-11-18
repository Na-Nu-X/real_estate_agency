import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';

import { SITE_CONFIG } from '../../core/config/site.config';
import { PROPERTY_TYPE_OPTIONS, PRICE_PRESETS } from '../../core/models/options';
import { PropertyType, TransactionType } from '../../core/models/property.model';
import { PropertyService } from '../../core/services/property.service';
import { toLoadState } from '../../core/utils/load-state';
import { AgentCardComponent } from '../../shared/components/agent-card/agent-card.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { PropertyCardComponent } from '../../shared/components/property-card/property-card.component';

@Component({
  selector: 'app-home',
  imports: [RouterLink, IconComponent, PropertyCardComponent, AgentCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly api = inject(PropertyService);
  private readonly router = inject(Router);

  protected readonly site = SITE_CONFIG;
  protected readonly typeOptions = PROPERTY_TYPE_OPTIONS;
  protected readonly pricePresets = PRICE_PRESETS;

  protected readonly featured = toSignal(toLoadState(this.api.list({ featured: true })), {
    initialValue: { status: 'loading' as const },
  });
  protected readonly agents = toSignal(toLoadState(this.api.agents()), {
    initialValue: { status: 'loading' as const },
  });

  // Quick search state
  protected readonly qsTransaction = signal<TransactionType>('predaj');
  protected readonly qsType = signal<PropertyType | ''>('');
  protected readonly qsCity = signal('');
  protected readonly qsMaxPrice = signal<number | ''>('');

  protected readonly skeletons = [1, 2, 3];

  protected setValue<T>(target: { set(v: T): void }, event: Event, numeric = false): void {
    const raw = (event.target as HTMLSelectElement).value;
    target.set((numeric && raw ? Number(raw) : raw) as T);
  }

  protected search(event: Event): void {
    event.preventDefault();
    const queryParams: Record<string, string | number> = { transaction: this.qsTransaction() };
    if (this.qsType()) queryParams['property_type'] = this.qsType();
    if (this.qsCity()) queryParams['city'] = this.qsCity();
    if (this.qsMaxPrice() !== '') queryParams['max_price'] = this.qsMaxPrice();
    this.router.navigate(['/ponuka'], { queryParams });
  }
}
