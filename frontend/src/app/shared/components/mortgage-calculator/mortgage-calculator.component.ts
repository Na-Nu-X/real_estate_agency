import { ChangeDetectionStrategy, Component, computed, input, linkedSignal, signal } from '@angular/core';

import { EurPipe } from '../../pipes/format.pipes';
import { monthlyPayment } from './mortgage';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

@Component({
  selector: 'app-mortgage-calculator',
  imports: [EurPipe],
  templateUrl: './mortgage-calculator.component.html',
  styleUrl: './mortgage-calculator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MortgageCalculatorComponent {
  /** Pre-fills the property price (e.g. from the detail page). */
  readonly initialPrice = input(250_000);

  protected readonly limits = {
    price: { min: 20_000, max: 5_000_000, step: 5_000 },
    down: { min: 10, max: 90, step: 1 },
    years: { min: 5, max: 30, step: 1 },
    rate: { min: 0.5, max: 10, step: 0.05 },
  } as const;

  protected readonly price = linkedSignal(() =>
    clamp(this.initialPrice(), this.limits.price.min, this.limits.price.max),
  );
  protected readonly downPaymentPct = signal(20);
  protected readonly years = signal(30);
  protected readonly ratePct = signal(3.89);

  protected readonly downPayment = computed(() => Math.round((this.price() * this.downPaymentPct()) / 100));
  protected readonly loanAmount = computed(() => this.price() - this.downPayment());
  protected readonly monthly = computed(() => monthlyPayment(this.loanAmount(), this.ratePct(), this.years()));
  protected readonly totalPaid = computed(() => this.monthly() * this.years() * 12);
  protected readonly totalInterest = computed(() => Math.max(0, this.totalPaid() - this.loanAmount()));
  /** Share of principal in the total repaid amount, for the ratio bar. */
  protected readonly principalShare = computed(() => {
    const total = this.totalPaid();
    return total > 0 ? (this.loanAmount() / total) * 100 : 100;
  });

  protected update(
    field: 'price' | 'down' | 'years' | 'rate',
    event: Event,
  ): void {
    const raw = (event.target as HTMLInputElement).valueAsNumber;
    if (Number.isNaN(raw)) return;
    const { min, max } = this.limits[field];
    const value = clamp(raw, min, max);
    switch (field) {
      case 'price':
        this.price.set(value);
        break;
      case 'down':
        this.downPaymentPct.set(value);
        break;
      case 'years':
        this.years.set(value);
        break;
      case 'rate':
        this.ratePct.set(Math.round(value * 100) / 100);
        break;
    }
  }

  /** CSS custom property for the filled part of a range track. */
  protected fill(value: number, min: number, max: number): string {
    return `${((value - min) / (max - min)) * 100}%`;
  }
}
