import { monthlyPayment } from './mortgage';

describe('monthlyPayment', () => {
  it('matches the standard annuity formula', () => {
    // 200 000 € at 4 % p.a. over 30 years ≈ 954.83 €
    expect(monthlyPayment(200_000, 4, 30)).toBeCloseTo(954.83, 2);
  });

  it('handles a zero interest rate', () => {
    expect(monthlyPayment(120_000, 0, 10)).toBe(1000);
  });

  it('returns 0 for an empty loan', () => {
    expect(monthlyPayment(0, 4, 30)).toBe(0);
  });
});
