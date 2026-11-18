import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PropertyListItem } from '../../../core/models/property.model';
import { AreaPipe, EurPipe, FloorPipe, RoomsPipe } from '../../pipes/format.pipes';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-property-card',
  imports: [RouterLink, IconComponent, EurPipe, AreaPipe, RoomsPipe, FloorPipe],
  templateUrl: './property-card.component.html',
  styleUrl: './property-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.is-list]': "layout() === 'list'",
    '[class.is-unavailable]': "property().badge === 'predane'",
  },
})
export class PropertyCardComponent {
  readonly property = input.required<PropertyListItem>();
  readonly layout = input<'grid' | 'list'>('grid');
  /** Set for above-the-fold cards to skip lazy loading. */
  readonly eager = input(false);

  protected readonly location = computed(() => {
    const p = this.property();
    return p.district ? `${p.city} · ${p.district.split(',')[0]}` : p.city;
  });

  /** Houses and land show plot size; apartments show the floor. */
  protected readonly showLand = computed(() => {
    const p = this.property();
    return (p.property_type === 'dom' || p.property_type === 'pozemok') && p.land_area !== null;
  });
}
