import { AfterViewInit, Directive, ElementRef, Input, NgZone, OnDestroy } from '@angular/core';

import { gsap } from '../core/gsap';

/** Pulls the host towards the pointer while it hovers (render it only on hover-capable devices). */
@Directive({ selector: '[appMagnetic]', standalone: true })
export class MagneticDirective implements AfterViewInit, OnDestroy {
  @Input() magneticStrength = 0.3;

  private removeListeners?: () => void;

  constructor(
    private readonly host: ElementRef<HTMLElement>,
    private readonly zone: NgZone,
  ) {}

  ngAfterViewInit(): void {
    const el = this.host.nativeElement;
    this.zone.runOutsideAngular(() => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });
      const move = (event: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        xTo((event.clientX - rect.left - rect.width / 2) * this.magneticStrength);
        yTo((event.clientY - rect.top - rect.height / 2) * this.magneticStrength);
      };
      const leave = () => {
        xTo(0);
        yTo(0);
      };
      el.addEventListener('mousemove', move);
      el.addEventListener('mouseleave', leave);
      this.removeListeners = () => {
        el.removeEventListener('mousemove', move);
        el.removeEventListener('mouseleave', leave);
        gsap.killTweensOf(el);
      };
    });
  }

  ngOnDestroy(): void {
    this.removeListeners?.();
  }
}
