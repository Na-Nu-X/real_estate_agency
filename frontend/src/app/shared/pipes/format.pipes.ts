import { Pipe, PipeTransform } from '@angular/core';

import { TransactionType } from '../../core/models/property.model';
import { formatEur, formatFloor, formatNumber, formatRooms } from '../../core/utils/format';

/** `{{ property.price | eur:property.transaction }}` → "1 290 000 €" or "1 350 € / mes." */
@Pipe({ name: 'eur' })
export class EurPipe implements PipeTransform {
  transform(value: number | null | undefined, transaction?: TransactionType): string {
    const formatted = formatEur(value);
    return transaction === 'prenajom' ? `${formatted} / mes.` : formatted;
  }
}

@Pipe({ name: 'area' })
export class AreaPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    return value === null || value === undefined ? '—' : `${formatNumber(value)} m²`;
  }
}

@Pipe({ name: 'rooms' })
export class RoomsPipe implements PipeTransform {
  transform(value: number): string {
    return formatRooms(value);
  }
}

@Pipe({ name: 'floor' })
export class FloorPipe implements PipeTransform {
  transform(value: number | null): string {
    return formatFloor(value);
  }
}
