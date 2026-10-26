import { NgFor } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';

import { gsap, ScrollTrigger } from '../../core/gsap';
import { MediaService } from '../../core/media.service';
import { SectionObserverDirective } from '../../core/section-observer.directive';
import { EXPERIENCE } from '../../data/portfolio.data';
import { Experience } from '../../data/portfolio.models';
import { alpha } from '../../shared/color';
import { SectionHeadingComponent } from '../../shared/section-heading/section-heading.component';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [NgFor, SectionHeadingComponent, SectionObserverDirective],
  templateUrl: './experience.component.html',
  styleUrls: ['./experience.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperienceComponent implements AfterViewInit, OnDestroy {
  readonly jobs = EXPERIENCE;
  readonly headingLines = ["Where I've", 'Shipped.'];
  readonly alpha = alpha;

  /** The row shown as open (aria-expanded, hint); lags behind while another row collapses. */
  openIndex: number | null = null;

  @ViewChild('timeline', { static: true }) private timeline!: ElementRef<HTMLElement>;
  @ViewChild('line', { static: true }) private line!: ElementRef<HTMLElement>;
  @ViewChildren('row') private rows!: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('panel') private panels!: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('num') private nums!: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('dot') private dots!: QueryList<ElementRef<HTMLElement>>;

  private autoOpened = false;
  private ctx?: gsap.Context;

  constructor(
    private readonly zone: NgZone,
    private readonly cdr: ChangeDetectorRef,
    private readonly media: MediaService,
  ) {}

  get reducedMotion(): boolean {
    return this.media.reducedMotion.matches;
  }

  index(i: number): string {
    return String(i + 1).padStart(2, '0');
  }

  host(url: string): string {
    return new URL(url).hostname.replace(/^www\./, '');
  }

  ngAfterViewInit(): void {
    const rows = this.rows.map((ref) => ref.nativeElement);
    if (this.reducedMotion) {
      gsap.set(rows, { opacity: 1, x: 0 });
      return;
    }
    this.zone.runOutsideAngular(() => {
      this.ctx = gsap.context(() => {
        const trigger = this.timeline.nativeElement;
        gsap.fromTo(
          this.line.nativeElement,
          { scaleY: 0 },
          { scaleY: 1, duration: 1.4, ease: 'power2.out', scrollTrigger: { trigger, start: 'top 75%', once: true } },
        );
        gsap.fromTo(
          rows,
          { opacity: 0, x: -40 },
          { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out', stagger: 0.15, scrollTrigger: { trigger, start: 'top 80%', once: true } },
        );
      });
    });
  }

  /** The first time the section comes into view, the most recent role opens by itself. */
  autoOpen(): void {
    if (this.autoOpened) return;
    this.autoOpened = true;
    if (this.openIndex === null) {
      this.openIndex = 0;
      this.open(0);
    }
  }

  /** One row open at a time: the open row collapses fully before the next one expands. */
  toggle(i: number): void {
    const current = this.openIndex;
    if (current === i) {
      this.openIndex = null;
      this.close(i);
    } else if (current === null) {
      this.openIndex = i;
      this.open(i);
    } else {
      this.close(current, () =>
        this.zone.run(() => {
          this.openIndex = i;
          this.cdr.markForCheck();
          this.open(i);
        }),
      );
    }
  }

  private open(i: number): void {
    const panel = this.panels.get(i)!.nativeElement;
    const accent = this.jobs[i].accent;
    if (this.reducedMotion) {
      panel.style.height = 'auto';
      ScrollTrigger.refresh();
      return;
    }
    this.zone.runOutsideAngular(() => {
      gsap.to(panel, {
        height: panel.scrollHeight,
        duration: 0.5,
        ease: 'power3.out',
        overwrite: true,
        // Content below moved: re-measure scroll triggers so later reveals stay in sync.
        onComplete: () => ScrollTrigger.refresh(),
      });
      gsap.to(this.nums.get(i)!.nativeElement, { color: accent, duration: 0.3 });
      gsap.to(this.dots.get(i)!.nativeElement, { backgroundColor: accent, scale: 1.6, duration: 0.3 });
    });
  }

  private close(i: number, done?: () => void): void {
    const panel = this.panels.get(i)!.nativeElement;
    const job: Experience = this.jobs[i];
    if (this.reducedMotion) {
      panel.style.height = '0px';
      done?.();
      ScrollTrigger.refresh();
      return;
    }
    this.zone.runOutsideAngular(() => {
      gsap.to(panel, {
        height: 0,
        duration: 0.35,
        ease: 'power3.in',
        overwrite: true,
        onComplete: () => {
          done?.();
          ScrollTrigger.refresh();
        },
      });
      gsap.to(this.nums.get(i)!.nativeElement, { color: alpha(job.accent, 0.18), duration: 0.3 });
      gsap.to(this.dots.get(i)!.nativeElement, { backgroundColor: alpha(job.accent, 0.3), scale: 1, duration: 0.3 });
    });
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
  }
}
