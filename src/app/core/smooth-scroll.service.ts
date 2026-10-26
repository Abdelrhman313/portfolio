import { Injectable, NgZone, OnDestroy } from '@angular/core';
import Lenis from 'lenis';

import { gsap, ScrollTrigger } from './gsap';
import { MediaService } from './media.service';

/** Lenis smooth wheel scrolling driven by the GSAP ticker, wired to ScrollTrigger. */
@Injectable({ providedIn: 'root' })
export class SmoothScrollService implements OnDestroy {
  private lenis?: Lenis;
  private initialized = false;
  private readonly tick = (time: number) => this.lenis?.raf(time * 1000);

  constructor(
    private readonly zone: NgZone,
    private readonly media: MediaService,
  ) {}

  init(): void {
    if (this.initialized) return;
    this.initialized = true;
    this.zone.runOutsideAngular(() => {
      // Reduced motion keeps native scrolling, which ScrollTrigger follows on its own.
      if (!this.media.reducedMotion.matches) {
        this.lenis = new Lenis({
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          touchMultiplier: 2,
        });
        this.lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add(this.tick);
        gsap.ticker.lagSmoothing(0);
      }

      setTimeout(() => ScrollTrigger.refresh(true), 150);
      setTimeout(() => ScrollTrigger.refresh(true), 600);
      window.addEventListener('load', () => ScrollTrigger.refresh(true), { once: true });
    });
  }

  stop(): void {
    this.lenis?.stop();
  }

  start(): void {
    this.lenis?.start();
  }

  ngOnDestroy(): void {
    gsap.ticker.remove(this.tick);
    this.lenis?.destroy();
  }
}
