import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SITE_CONFIG } from './core/config/site.config';
import { FooterComponent } from './shared/components/footer/footer.component';
import { NavbarComponent } from './shared/components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="skip-link" href="#main">Preskočiť na obsah</a>
    <app-navbar />
    <main id="main">
      <router-outlet />
    </main>
    <app-footer />
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    main {
      flex: 1;
      padding-top: var(--header-h);
    }
    .skip-link {
      position: fixed;
      top: -100px;
      left: 1rem;
      z-index: 1000;
      padding: 0.75rem 1rem;
      background: var(--color-accent);
      color: #fff;
      &:focus {
        top: 1rem;
      }
    }
  `,
})
export class App {
  constructor() {
    // Apply white-label theme overrides from site.config.ts
    const root = inject(DOCUMENT).documentElement;
    for (const [token, value] of Object.entries(SITE_CONFIG.theme)) {
      if (value) root.style.setProperty(token, value);
    }
  }
}
