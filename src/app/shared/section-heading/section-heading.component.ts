import { NgFor } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';

import { gsap, ScrollTrigger } from '../../core/gsap';
import { MediaService } from '../../core/media.service';
import { splitChars } from '../split-chars';

@Component({
  selector: 'app-section-heading',
  standalone: true,
  imports: [NgFor],
  templateUrl: './section-heading.component.html',
  styleUrls: ['./section-heading.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionHeadingComponent implements AfterViewInit, OnDestroy {
  /** e.g. "02 · The Origin" */
  @Input({ required: true }) kicker!: string;
  /** The title, one entry per line. */
  @Input({ required: true }) lines!: string[];

  @ViewChild('root', { static: true }) private root!: ElementRef<HTMLElement>;
  @ViewChild('kickerEl', { static: true }) private kickerEl!: ElementRef<HTMLElement>;
  @ViewChild('titleEl', { static: true }) private titleEl!: ElementRef<HTMLElement>;
  @ViewChildren('line') private lineEls!: QueryList<ElementRef<HTMLElement>>;

  private ctx?: gsap.Context;

  constructor(
    private readonly zone: NgZone,
    private readonly media: MediaService,
  ) {}

  ngAfterViewInit(): void {
    const kicker = this.kickerEl.nativeElement;
    const title = this.titleEl.nativeElement;

    if (this.media.reducedMotion.matches) {
      gsap.set([kicker, title], { opacity: 1 });
      return;
    }

    this.zone.runOutsideAngular(() => {
      this.ctx = gsap.context(() => {
        const chars = this.lineEls.toArray().flatMap((line) => splitChars(line.nativeElement));
        const trigger = { trigger: this.root.nativeElement, start: 'top 80%', invalidateOnRefresh: true };

        ScrollTrigger.create({ ...trigger, onEnter: () => gsap.set(title, { opacity: 1 }) });
        gsap.fromTo(kicker, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', scrollTrigger: trigger });
        // Chars are not pre-hidden: the title appears whole, then each letter drops and
        // rises back in a left-to-right wave — the reference's exact behaviour.
        gsap.fromTo(
          chars,
          { y: '110%', opacity: 0 },
          { y: 0, opacity: 1, duration: 0.75, ease: 'power4.out', stagger: 0.03, immediateRender: false, scrollTrigger: trigger },
        );
      });
    });
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
  }
}
