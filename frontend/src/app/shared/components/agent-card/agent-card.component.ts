import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { Agent, AgentSummary } from '../../../core/models/property.model';
import { pluralize } from '../../../core/utils/format';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-agent-card',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let a = agent();
    <article class="agent">
      <div class="agent__photo">
        <img [src]="a.photo_url" [alt]="a.full_name" width="600" height="750" loading="lazy" decoding="async" />
      </div>
      <div class="agent__body">
        <h3 class="agent__name">{{ a.full_name }}</h3>
        <p class="agent__role">{{ a.role }}</p>
        @if (listingsLabel(); as label) {
          <p class="agent__listings">{{ label }}</p>
        }
        <div class="agent__contact">
          <a [href]="'tel:' + phoneDigits()"><app-icon name="phone" [size]="15" />{{ a.phone }}</a>
          <a [href]="'mailto:' + a.email"><app-icon name="mail" [size]="15" />E-mail</a>
        </div>
      </div>
    </article>
  `,
  styles: `
    @use 'variables' as *;
    @use 'mixins' as *;

    :host {
      display: block;
    }
    .agent {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    .agent__body {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .agent__photo {
      aspect-ratio: 4 / 5;
      overflow: hidden;
      background: var(--color-surface-alt);

      img {
        @include cover-image;
        filter: grayscale(0.25);
        transition: transform 1s $ease-out-expo, filter $duration-slow $ease;
      }
    }
    .agent:hover .agent__photo img {
      transform: scale(1.04);
      filter: grayscale(0);
    }
    .agent__body {
      padding-top: 1.25rem;
    }
    .agent__name {
      font-size: 1.625rem;
    }
    .agent__role {
      margin: 0.375rem 0 0;
      font-size: 0.875rem;
      color: var(--color-text-muted);
    }
    .agent__listings {
      margin: 0.5rem 0 1rem;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--color-brass);
    }
    .agent__contact {
      margin-top: auto !important;
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem 1.25rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--color-border);
      font-size: 0.875rem;

      a {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        transition: color $duration $ease;

        &:hover {
          color: var(--color-accent);
        }
      }
      app-icon {
        color: var(--color-brass);
      }
    }
  `,
})
export class AgentCardComponent {
  readonly agent = input.required<Agent | AgentSummary>();

  protected readonly phoneDigits = computed(() => this.agent().phone.replace(/\s+/g, ''));
  protected readonly listingsLabel = computed(() => {
    const a = this.agent();
    if (!('active_listings_count' in a)) return null;
    const n = a.active_listings_count;
    return `${n} ${pluralize(n, 'aktívna ponuka', 'aktívne ponuky', 'aktívnych ponúk')}`;
  });
}
