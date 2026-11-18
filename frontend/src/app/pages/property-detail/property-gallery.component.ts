import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';

import { PropertyImage } from '../../core/models/property.model';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-property-gallery',
  imports: [IconComponent],
  templateUrl: './property-gallery.component.html',
  styleUrl: './property-gallery.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown)': 'onKeydown($event)',
  },
})
export class PropertyGalleryComponent {
  readonly images = input.required<PropertyImage[]>();
  readonly title = input('');

  protected readonly index = signal(0);
  protected readonly lightboxOpen = signal(false);
  protected readonly current = computed(() => this.images()[this.index()] ?? null);
  protected readonly count = computed(() => this.images().length);

  private readonly document = inject(DOCUMENT);
  private readonly thumbs = viewChild<ElementRef<HTMLElement>>('thumbs');
  private readonly lightboxEl = viewChild<ElementRef<HTMLElement>>('lightbox');
  private touchStartX: number | null = null;
  private lastFocused: HTMLElement | null = null;

  constructor() {
    effect(() => {
      this.document.body.classList.toggle('no-scroll', this.lightboxOpen());
    });
    // Keep the active thumbnail in view
    effect(() => {
      const i = this.index();
      const strip = this.thumbs()?.nativeElement;
      const thumb = strip?.children.item(i) as HTMLElement | null;
      thumb?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    });
    // Move focus into the lightbox when it opens
    effect(() => {
      if (this.lightboxOpen()) {
        queueMicrotask(() => this.lightboxEl()?.nativeElement.focus());
      }
    });
  }

  protected select(i: number): void {
    this.index.set(i);
  }

  protected next(): void {
    const n = this.count();
    if (n) this.index.update((i) => (i + 1) % n);
  }

  protected prev(): void {
    const n = this.count();
    if (n) this.index.update((i) => (i - 1 + n) % n);
  }

  protected open(i = this.index()): void {
    this.lastFocused = this.document.activeElement as HTMLElement | null;
    this.index.set(i);
    this.lightboxOpen.set(true);
  }

  protected close(): void {
    this.lightboxOpen.set(false);
    this.lastFocused?.focus();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (!this.lightboxOpen()) return;
    if (event.key === 'Escape') this.close();
    else if (event.key === 'ArrowRight') this.next();
    else if (event.key === 'ArrowLeft') this.prev();
  }

  protected onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0]?.clientX ?? null;
  }

  protected onTouchEnd(event: TouchEvent): void {
    if (this.touchStartX === null) return;
    const dx = (event.changedTouches[0]?.clientX ?? this.touchStartX) - this.touchStartX;
    if (Math.abs(dx) > 50) {
      if (dx < 0) this.next();
      else this.prev();
    }
    this.touchStartX = null;
  }
}
