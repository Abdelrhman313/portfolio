import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';

import { gsap, ScrollTrigger } from '../../core/gsap';

@Component({
  selector: 'app-scroll-progress',
  standalone: true,
  template: `<div class="progress" aria-hidden="true"><div class="progress__fill" #fill></div></div>`,
  styles: [
    `
      .progress {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 60;
        height: 3px;
        pointer-events: none;
        background: rgba(200, 96, 42, 0.12);
      }
      .progress__fill {
        width: 100%;
        height: 100%;
        transform-origin: left center;
        transform: scaleX(0);
        background: #c8602a;
        box-shadow: 0 0 8px rgba(200, 96, 42, 0.6);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollProgressComponent implements AfterViewInit, OnDestroy {
  @ViewChild('fill', { static: true }) private fill!: ElementRef<HTMLElement>;
  private ctx?: gsap.Context;

  constructor(private readonly zone: NgZone) {}

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.ctx = gsap.context(() => {
        const fill = this.fill.nativeElement;
        gsap.set(fill, { scaleX: 0 });
        const setProgress = gsap.quickTo(fill, 'scaleX', { duration: 0.1, ease: 'none' });
        ScrollTrigger.create({ start: 'top top', end: 'bottom bottom', onUpdate: (self) => setProgress(self.progress) });
      });
    });
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
  }
}
