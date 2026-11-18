import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormGroup } from '@angular/forms';

import { ApiFieldErrors } from '../models/lead.model';
import { pluralize } from './format';

/** Slovak validation message for the first error on a control. */
export function controlError(control: AbstractControl | null): string | null {
  if (!control || !control.invalid || !(control.touched || control.dirty)) {
    return null;
  }
  const e = control.errors ?? {};
  if (e['server']) return e['server'] as string;
  if (e['required']) return 'Toto pole je povinné.';
  if (e['requiredTrue']) return 'Pre odoslanie je potrebný váš súhlas.';
  if (e['email']) return 'Zadajte platnú e-mailovú adresu.';
  if (e['minlength']) {
    const n = e['minlength'].requiredLength as number;
    return `Zadajte aspoň ${n} ${pluralize(n, 'znak', 'znaky', 'znakov')}.`;
  }
  if (e['maxlength']) return `Maximálna dĺžka je ${e['maxlength'].requiredLength} znakov.`;
  if (e['min']) return `Minimálna hodnota je ${e['min'].min}.`;
  if (e['max']) return `Maximálna hodnota je ${e['max'].max}.`;
  if (e['pattern']) return 'Zadajte platné telefónne číslo, napr. +421 900 123 456.';
  if (e['futureDate']) return 'Zvoľte termín v budúcnosti.';
  return 'Skontrolujte zadanú hodnotu.';
}

export const PHONE_PATTERN = /^\+?[0-9 ()/-]{9,20}$/;

/**
 * Maps a DRF 400 response onto form controls (as a `server` error).
 * Returns a general message for errors that could not be attached to a field.
 */
export function applyServerErrors(form: FormGroup, error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 400 && error.error && typeof error.error === 'object') {
      const body = error.error as ApiFieldErrors;
      const unmatched: string[] = [];
      for (const [field, messages] of Object.entries(body)) {
        const control = form.get(field);
        const message = Array.isArray(messages) ? messages.join(' ') : String(messages);
        if (control) {
          control.setErrors({ server: message });
          control.markAsTouched();
        } else {
          unmatched.push(message);
        }
      }
      return unmatched.length ? unmatched.join(' ') : 'Skontrolujte, prosím, zvýraznené polia.';
    }
    if (error.status === 429) {
      return 'Odoslali ste príliš veľa požiadaviek. Skúste to, prosím, neskôr alebo nám zavolajte.';
    }
    if (error.status === 0) {
      return 'Nepodarilo sa spojiť so serverom. Skontrolujte pripojenie a skúste to znova.';
    }
  }
  return 'Pri odosielaní nastala chyba. Skúste to, prosím, znova alebo nás kontaktujte telefonicky.';
}

export function futureDateValidator(control: AbstractControl) {
  if (!control.value) return null;
  return new Date(control.value).getTime() > Date.now() ? null : { futureDate: true };
}
