import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { startWith } from 'rxjs';

import { SITE_CONFIG } from '../../core/config/site.config';
import { CONDITION_OPTIONS, PROPERTY_TYPE_SINGULAR, ROOM_OPTIONS } from '../../core/models/options';
import { PropertyCondition, PropertyType } from '../../core/models/property.model';
import { LeadService } from '../../core/services/lead.service';
import { PHONE_PATTERN, applyServerErrors, controlError } from '../../core/utils/form-errors';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { IconName } from '../../shared/components/icon/icons';

type Step = 0 | 1 | 2;

@Component({
  selector: 'app-sell',
  imports: [ReactiveFormsModule, RouterLink, IconComponent],
  templateUrl: './sell.component.html',
  styleUrl: './sell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SellComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly leads = inject(LeadService);
  private readonly wizardEl = viewChild<ElementRef<HTMLElement>>('wizard');

  protected readonly site = SITE_CONFIG;
  protected readonly phoneHref = `tel:${SITE_CONFIG.phone.replace(/\s+/g, '')}`;
  protected readonly conditionOptions = CONDITION_OPTIONS;
  protected readonly roomOptions = ROOM_OPTIONS;
  protected readonly controlError = controlError;

  protected readonly typeCards: { value: PropertyType; label: string; icon: IconName }[] = [
    { value: 'byt', label: 'Byt', icon: 'building' },
    { value: 'dom', label: 'Dom', icon: 'home' },
    { value: 'pozemok', label: 'Pozemok', icon: 'land' },
    { value: 'komercne', label: 'Komerčný', icon: 'briefcase' },
  ];

  protected readonly steps = ['Nehnuteľnosť', 'Parametre', 'Kontakt'];

  protected readonly process = [
    { title: 'Konzultácia a ocenenie', text: 'Obhliadka, analýza trhu a stanovenie optimálnej ceny do 48 hodín.' },
    { title: 'Príprava a prezentácia', text: 'Home staging, profesionálne foto a video, 3D prehliadka a pôdorysy.' },
    { title: 'Marketing a obhliadky', text: 'Oslovenie overených klientov, prémiová inzercia a organizácia obhliadok.' },
    { title: 'Bezpečný prevod', text: 'Zmluvy, úschova kúpnej ceny, vklad do katastra a odovzdanie nehnuteľnosti.' },
  ];

  protected readonly faqs = [
    {
      q: 'Je odhad ceny naozaj bezplatný a nezáväzný?',
      a: 'Áno. Odhad trhovej ceny vám pripravíme zdarma a nezaväzuje vás k podpisu zmluvy o sprostredkovaní.',
    },
    {
      q: 'Ako dlho trvá predaj nehnuteľnosti?',
      a: 'Pri správne nastavenej cene predávame byty v priemere do 45 dní a rodinné domy do 90 dní od spustenia marketingu.',
    },
    {
      q: 'Koľko stojí vaša služba?',
      a: 'Províziu dohadujeme individuálne podľa typu a hodnoty nehnuteľnosti. Platíte ju až po úspešnom predaji.',
    },
    {
      q: 'Môžem predať nehnuteľnosť diskrétne, bez verejnej inzercie?',
      a: 'Áno. Pri off-market predaji oslovujeme výhradne preverených klientov z našej databázy.',
    },
  ];

  protected readonly step = signal<Step>(0);
  protected readonly submitting = signal(false);
  protected readonly submitted = signal(false);
  protected readonly formError = signal<string | null>(null);

  protected readonly form = this.fb.group({
    property: this.fb.group({
      property_type: this.fb.control<PropertyType | ''>('', Validators.required),
      location: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    }),
    details: this.fb.group({
      floor_area: this.fb.control<number | null>(null, [Validators.required, Validators.min(1), Validators.max(100000)]),
      rooms: this.fb.control<number | null>(null),
      condition: this.fb.control<PropertyCondition | ''>('', Validators.required),
    }),
    contact: this.fb.group({
      owner_name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
      phone: ['', [Validators.required, Validators.pattern(PHONE_PATTERN)]],
      email: ['', [Validators.required, Validators.email]],
      notes: [''],
      consent: [false, Validators.requiredTrue],
    }),
  });

  private readonly propertyType = toSignal(
    this.form.controls.property.controls.property_type.valueChanges.pipe(
      startWith(this.form.controls.property.controls.property_type.value),
    ),
    { requireSync: true },
  );

  /** Land has no rooms – hide the field. */
  protected readonly needsRooms = computed(() => {
    const t = this.propertyType();
    return t !== 'pozemok' && t !== '';
  });

  protected readonly typeLabel = computed(() => {
    const t = this.propertyType();
    return t ? PROPERTY_TYPE_SINGULAR[t] : '';
  });

  private readonly groups = [this.form.controls.property, this.form.controls.details, this.form.controls.contact];

  protected next(): void {
    const group = this.groups[this.step()];
    if (group.invalid) {
      group.markAllAsTouched();
      return;
    }
    this.step.update((s) => Math.min(2, s + 1) as Step);
    this.scrollToWizard();
  }

  protected back(): void {
    this.step.update((s) => Math.max(0, s - 1) as Step);
  }

  protected goTo(target: number): void {
    // Only allow jumping back to completed steps
    if (target < this.step()) this.step.set(target as Step);
  }

  protected selectType(value: PropertyType): void {
    const control = this.form.controls.property.controls.property_type;
    control.setValue(value);
    control.markAsTouched();
  }

  protected selectRooms(value: number): void {
    const control = this.form.controls.details.controls.rooms;
    control.setValue(control.value === value ? null : value);
  }

  protected submit(): void {
    this.formError.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      const firstInvalid = this.groups.findIndex((g) => g.invalid);
      if (firstInvalid >= 0) this.step.set(firstInvalid as Step);
      return;
    }
    const { property, details, contact } = this.form.getRawValue();
    this.submitting.set(true);
    this.leads
      .requestValuation({
        property_type: property.property_type as PropertyType,
        location: property.location.trim(),
        floor_area: Number(details.floor_area),
        rooms: this.needsRooms() ? (details.rooms ?? 0) : 0,
        condition: details.condition as PropertyCondition,
        owner_name: contact.owner_name.trim(),
        phone: contact.phone.trim(),
        email: contact.email.trim(),
        notes: contact.notes.trim(),
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.submitted.set(true);
          this.scrollToWizard();
        },
        error: (err: unknown) => {
          this.submitting.set(false);
          this.formError.set(applyServerErrors(this.form, err));
          const firstInvalid = this.groups.findIndex((g) => g.invalid);
          if (firstInvalid >= 0) this.step.set(firstInvalid as Step);
        },
      });
  }

  protected startOver(): void {
    this.form.reset();
    this.step.set(0);
    this.submitted.set(false);
  }

  private scrollToWizard(): void {
    const el = this.wizardEl()?.nativeElement;
    if (el && el.getBoundingClientRect().top < 0) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
