import { AfterViewInit, Directive, ElementRef, Input, NgZone, OnDestroy } from '@angular/core';

import { gsap } from '../core/gsap';
import { MediaService } from '../core/media.service';

/** Fades and lifts the host's children in when it scrolls into view. */
@Directive({ selector: '[appTextReveal]', standalone: true })
export class TextRevealDirective implements AfterViewInit, OnDestroy {
  @Input() revealDelay = 0;

  private ctx?: gsap.Context;

  constructor(
    private readonly host: ElementRef<HTMLElement>,
    private readonly zone: NgZone,
    private readonly media: MediaService,
  ) {}

  ngAfterViewInit(): void {
    const children = Array.from(this.host.nativeElement.children);
    if (this.media.reducedMotion.matches) {
      gsap.set(children, { opacity: 1, y: 0 });
      return;
    }
    this.zone.runOutsideAngular(() => {
      this.ctx = gsap.context(() => {
        gsap.fromTo(
          children,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.06,
            duration: 0.7,
            ease: 'power3.out',
            delay: this.revealDelay,
            scrollTrigger: { trigger: this.host.nativeElement, start: 'top 80%' },
          },
        );
      });
    });
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
  }
}
