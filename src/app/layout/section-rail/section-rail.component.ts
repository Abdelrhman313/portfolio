import { NgFor, NgIf } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild,
} from '@angular/core';

import { SECTION_IDS } from '../../core/active-section.service';
import { gsap, ScrollTrigger } from '../../core/gsap';

/** Fixed left-hand progress thread with one orb per section (md and up). */
@Component({
  selector: 'app-section-rail',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './section-rail.component.html',
  styleUrls: ['./section-rail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionRailComponent implements AfterViewInit, OnDestroy {
  @ViewChild('fill', { static: true }) private fill!: ElementRef<HTMLElement>;

  readonly labels = SECTION_IDS.map((_, i) => String(i + 1).padStart(2, '0'));
  /** Orb positions in % of the viewport height; evenly spread until measured. */
  positions = SECTION_IDS.map((_, i) => 6 + (i / (SECTION_IDS.length - 1)) * 88);
  active = 0;

  private thresholds = this.positions.map((p) => p / 100);
  private ctx?: gsap.Context;
  private cleanup?: () => void;

  constructor(
    private readonly zone: NgZone,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.ctx = gsap.context(() => {
        const setFill = gsap.quickTo(this.fill.nativeElement, 'scaleY', { duration: 0.1, ease: 'none' });
        ScrollTrigger.create({
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          onUpdate: (self) => {
            setFill(self.progress);
            let index = 0;
            this.thresholds.forEach((t, i) => {
              if (t <= self.progress + 0.01) index = i;
            });
            if (index !== this.active) this.zone.run(() => this.setActive(index));
          },
        });
      });

      // Like the reference, orb positions are measured shortly after start and on resize only.
      const timer = setTimeout(() => this.zone.run(() => this.measure()), 300);
      const onResize = () => this.zone.run(() => this.measure());
      window.addEventListener('resize', onResize);
      this.cleanup = () => {
        clearTimeout(timer);
        window.removeEventListener('resize', onResize);
      };
    });
  }

  private setActive(index: number): void {
    this.active = index;
    this.cdr.markForCheck();
  }

  private measure(): void {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollable <= 0) return;
    const offset = window.innerHeight * 0.4;
    this.thresholds = SECTION_IDS.map((id) => {
      const section = document.getElementById(id);
      return section ? Math.max(0, section.offsetTop - offset) / scrollable : 0;
    });
    this.positions = this.thresholds.map((t) => Math.min(98, Math.max(2, t * 100)));
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
    this.cleanup?.();
  }
}
