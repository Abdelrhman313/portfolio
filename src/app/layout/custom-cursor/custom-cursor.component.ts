import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';

import { gsap } from '../../core/gsap';
import { MediaService } from '../../core/media.service';

const BLOB_SHAPES = [
  '80% 20% 20% 80% / 80% 20% 80% 20%',
  '20% 80% 80% 20% / 20% 80% 20% 80%',
  '50% 50% 20% 80% / 80% 20% 50% 50%',
  '20% 80% 50% 50% / 50% 50% 80% 20%',
  '70% 30% 80% 20% / 20% 80% 30% 70%',
];

/** A morphing terracotta blob that trails the pointer; disabled on coarse pointers. */
@Component({
  selector: 'app-custom-cursor',
  standalone: true,
  template: `<div class="cursor" #cursor aria-hidden="true"></div>`,
  styles: [
    `
      .cursor {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 9999;
        width: 24px;
        height: 24px;
        margin-left: -12px;
        margin-top: -12px;
        pointer-events: none;
        opacity: 0;
        filter: blur(1.5px);
        border-radius: 80% 20% 20% 80% / 80% 20% 80% 20%;
        background: radial-gradient(circle at 40% 40%, #e8895a, #c8602a);
        box-shadow: 0 0 10px rgba(200, 96, 42, 0.5);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomCursorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('cursor', { static: true }) private cursor!: ElementRef<HTMLElement>;
  private cleanup?: () => void;

  constructor(
    private readonly zone: NgZone,
    private readonly media: MediaService,
  ) {}

  ngAfterViewInit(): void {
    if (this.media.coarsePointer) return;
    const el = this.cursor.nativeElement;

    this.zone.runOutsideAngular(() => {
      el.style.opacity = '1';
      document.documentElement.style.cursor = 'none';

      const xTo = gsap.quickTo(el, 'x', { duration: 0.25, ease: 'power2.out' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.25, ease: 'power2.out' });
      const move = (event: MouseEvent) => {
        xTo(event.clientX);
        yTo(event.clientY);
      };
      window.addEventListener('mousemove', move);

      const morph = (index: number): void => {
        gsap.to(el, {
          borderRadius: BLOB_SHAPES[index],
          duration: 1,
          ease: 'sine.inOut',
          onComplete: () => morph((index + 1) % BLOB_SHAPES.length),
        });
      };
      if (!this.media.reducedMotion.matches) morph(1);

      this.cleanup = () => {
        window.removeEventListener('mousemove', move);
        gsap.killTweensOf(el);
        document.documentElement.style.cursor = '';
      };
    });
  }

  ngOnDestroy(): void {
    this.cleanup?.();
  }
}
