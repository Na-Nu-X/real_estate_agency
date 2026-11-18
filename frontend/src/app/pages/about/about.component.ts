import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { combineLatest } from 'rxjs';

import { SITE_CONFIG } from '../../core/config/site.config';
import { Agent, PropertyListItem } from '../../core/models/property.model';
import { PropertyService } from '../../core/services/property.service';
import { pluralize } from '../../core/utils/format';
import { LoadState, toLoadState } from '../../core/utils/load-state';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { EurPipe } from '../../shared/pipes/format.pipes';

interface AgentWithListings {
  agent: Agent;
  listings: PropertyListItem[];
  listingsLabel: string;
  phoneHref: string;
}

@Component({
  selector: 'app-about',
  imports: [RouterLink, IconComponent, EurPipe],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent {
  private readonly api = inject(PropertyService);

  protected readonly site = SITE_CONFIG;

  private readonly state = toSignal(
    toLoadState(combineLatest([this.api.agents(), this.api.list()])),
    { initialValue: { status: 'loading' } as LoadState<[Agent[], PropertyListItem[]]> },
  );

  protected readonly status = computed(() => this.state().status);

  protected readonly team = computed<AgentWithListings[]>(() => {
    const s = this.state();
    if (s.status !== 'success') return [];
    const [agents, properties] = s.data;
    return agents.map((agent) => {
      const listings = properties.filter((p) => p.agent === agent.id && p.badge !== 'predane');
      const n = agent.active_listings_count;
      return {
        agent,
        listings,
        listingsLabel: `${n} ${pluralize(n, 'aktívna ponuka', 'aktívne ponuky', 'aktívnych ponúk')}`,
        phoneHref: `tel:${agent.phone.replace(/\s+/g, '')}`,
      };
    });
  });

  protected readonly values = [
    { title: 'Diskrétnosť', text: 'Mnohé transakcie realizujeme bez verejnej inzercie. Súkromie klientov je pre nás samozrejmosťou.' },
    { title: 'Odbornosť', text: 'Makléri s certifikáciou NARKS, vlastný právny tím a spolupráca s overenými znalcami a bankami.' },
    { title: 'Osobný prístup', text: 'Každý klient má jedného makléra, ktorý ho sprevádza od prvého stretnutia až po odovzdanie kľúčov.' },
  ];
}
