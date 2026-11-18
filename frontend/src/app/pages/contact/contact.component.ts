import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

import { SITE_CONFIG } from '../../core/config/site.config';
import { LeadService } from '../../core/services/lead.service';
import { PHONE_PATTERN, applyServerErrors, controlError } from '../../core/utils/form-errors';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule, RouterLink, IconComponent],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly leads = inject(LeadService);

  protected readonly site = SITE_CONFIG;
  protected readonly phoneHref = `tel:${SITE_CONFIG.phone.replace(/\s+/g, '')}`;
  protected readonly controlError = controlError;
  protected readonly subjects = ['Kúpa nehnuteľnosti', 'Predaj nehnuteľnosti', 'Prenájom', 'Ocenenie nehnuteľnosti', 'Iné'];

  /** OpenStreetMap embed built from numeric coordinates in site.config.ts. */
  protected readonly mapUrl = (() => {
    const { lat, lng } = SITE_CONFIG.address;
    const d = 0.006;
    const url =
      `https://www.openstreetmap.org/export/embed.html?bbox=${lng - d}%2C${lat - d / 2}%2C${lng + d}%2C${lat + d / 2}` +
      `&layer=mapnik&marker=${lat}%2C${lng}`;
    return inject(DomSanitizer).bypassSecurityTrustResourceUrl(url);
  })();
  protected readonly mapLink = `https://www.openstreetmap.org/?mlat=${SITE_CONFIG.address.lat}&mlon=${SITE_CONFIG.address.lng}#map=17/${SITE_CONFIG.address.lat}/${SITE_CONFIG.address.lng}`;

  protected readonly submitting = signal(false);
  protected readonly sent = signal(false);
  protected readonly formError = signal<string | null>(null);

  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.pattern(PHONE_PATTERN)]],
    subject: [this.subjects[0]],
    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(4000)]],
    consent: [false, Validators.requiredTrue],
  });

  protected submit(): void {
    this.formError.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { consent: _consent, ...payload } = this.form.getRawValue();
    this.submitting.set(true);
    this.leads
      .sendContactMessage({
        ...payload,
        name: payload.name.trim(),
        email: payload.email.trim(),
        phone: payload.phone.trim(),
        message: payload.message.trim(),
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.sent.set(true);
          this.form.reset();
        },
        error: (err: unknown) => {
          this.submitting.set(false);
          this.formError.set(applyServerErrors(this.form, err));
        },
      });
  }
}
