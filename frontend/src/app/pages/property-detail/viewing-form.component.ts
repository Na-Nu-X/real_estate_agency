import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { LeadService } from '../../core/services/lead.service';
import { PHONE_PATTERN, applyServerErrors, controlError, futureDateValidator } from '../../core/utils/form-errors';
import { IconComponent } from '../../shared/components/icon/icon.component';

type SubmitState = 'idle' | 'submitting' | 'success';

/** Local "YYYY-MM-DDTHH:mm" string for the datetime-local `min` attribute. */
function localDateTimeString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

@Component({
  selector: 'app-viewing-form',
  imports: [ReactiveFormsModule, RouterLink, IconComponent],
  templateUrl: './viewing-form.component.html',
  styles: `
    .viewing-form {
      display: flex;
      flex-direction: column;
      gap: 1.125rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewingFormComponent {
  readonly propertySlug = input.required<string>();
  readonly propertyTitle = input.required<string>();

  private readonly leads = inject(LeadService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly state = signal<SubmitState>('idle');
  protected readonly formError = signal<string | null>(null);
  protected readonly minDate = localDateTimeString(new Date(Date.now() + 60 * 60 * 1000));
  protected readonly controlError = controlError;

  protected readonly form = this.fb.group({
    client_name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(PHONE_PATTERN)]],
    preferred_datetime: ['', [futureDateValidator]],
    message: [''],
    consent: [false, [Validators.requiredTrue]],
  });

  protected submit(): void {
    this.formError.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.state.set('submitting');
    this.leads
      .requestViewing({
        property: this.propertySlug(),
        client_name: v.client_name.trim(),
        email: v.email.trim(),
        phone: v.phone.trim(),
        preferred_datetime: v.preferred_datetime ? new Date(v.preferred_datetime).toISOString() : null,
        message: v.message.trim(),
      })
      .subscribe({
        next: () => {
          this.state.set('success');
          this.form.reset();
        },
        error: (err: unknown) => {
          this.state.set('idle');
          this.formError.set(applyServerErrors(this.form, err));
        },
      });
  }

  protected reset(): void {
    this.state.set('idle');
  }
}
