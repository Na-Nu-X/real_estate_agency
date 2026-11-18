import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section container nf">
      <span class="nf__code">404</span>
      <h1>Táto stránka neexistuje</h1>
      <p class="lead">Adresa mohla byť zmenená alebo stránka bola odstránená. Skúste začať od našej aktuálnej ponuky.</p>
      <div class="nf__actions">
        <a routerLink="/ponuka" class="btn btn--primary">
          Prezrieť ponuku
          <app-icon name="arrow-right" [size]="16" class="btn__arrow" />
        </a>
        <a routerLink="/" class="btn btn--outline">Domov</a>
      </div>
    </section>
  `,
  styles: `
    .nf {
      text-align: center;
      max-width: 44rem;
    }
    .nf__code {
      display: block;
      font-family: var(--font-serif);
      font-size: clamp(6rem, 18vw, 11rem);
      line-height: 1;
      font-style: italic;
      color: var(--color-brass);
    }
    h1 {
      margin: 1rem 0 1.25rem;
    }
    .nf__actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.75rem;
      margin-top: 2rem;
    }
  `,
})
export class NotFoundComponent {}
