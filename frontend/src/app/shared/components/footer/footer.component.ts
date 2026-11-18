import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SITE_CONFIG } from '../../../core/config/site.config';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, IconComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  protected readonly site = SITE_CONFIG;
  protected readonly year = new Date().getFullYear();
  protected readonly phoneHref = `tel:${SITE_CONFIG.phone.replace(/\s+/g, '')}`;

  protected readonly offerLinks = [
    { label: 'Byty na predaj', params: { transaction: 'predaj', property_type: 'byt' } },
    { label: 'Domy na predaj', params: { transaction: 'predaj', property_type: 'dom' } },
    { label: 'Pozemky', params: { property_type: 'pozemok' } },
    { label: 'Prenájom', params: { transaction: 'prenajom' } },
    { label: 'Exkluzívne ponuky', params: { featured: 'true' } },
  ];
}
