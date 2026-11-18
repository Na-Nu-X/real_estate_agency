import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { ICONS, IconName, IconNode } from './icons';

@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'aria-hidden': 'true',
    '[style.width.px]': 'size()',
    '[style.height.px]': 'size()',
  },
  template: `
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      [attr.stroke-width]="strokeWidth()"
      stroke-linecap="round"
      stroke-linejoin="round"
      focusable="false"
    >
      @for (node of nodes(); track $index) {
        @switch (node[0]) {
          @case ('path') {
            <svg:path [attr.d]="attr(node, 'd')" />
          }
          @case ('circle') {
            <svg:circle [attr.cx]="attr(node, 'cx')" [attr.cy]="attr(node, 'cy')" [attr.r]="attr(node, 'r')" />
          }
          @case ('rect') {
            <svg:rect
              [attr.x]="attr(node, 'x')"
              [attr.y]="attr(node, 'y')"
              [attr.width]="attr(node, 'width')"
              [attr.height]="attr(node, 'height')"
              [attr.rx]="attr(node, 'rx')"
            />
          }
        }
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      flex: none;
      line-height: 0;
    }
    svg {
      width: 100%;
      height: 100%;
    }
  `,
})
export class IconComponent {
  readonly name = input.required<IconName>();
  readonly size = input<number>(20);
  readonly strokeWidth = input<number>(1.5);

  protected readonly nodes = computed<IconNode[]>(() => ICONS[this.name()]);

  protected attr(node: IconNode, key: string): string | number | null {
    const value = (node[1] as Record<string, string | number | undefined>)[key];
    return value ?? null;
  }
}
