import { NgFor, NgIf } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
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
import { ABOUT, PROFILE } from '../../data/portfolio.data';
import { SectionHeadingComponent } from '../../shared/section-heading/section-heading.component';
import { TextRevealDirective } from '../../shared/text-reveal.directive';
import { AvatarCardComponent } from './avatar-card.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [NgFor, NgIf, SectionHeadingComponent, TextRevealDirective, SectionObserverDirective, AvatarCardComponent],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent implements AfterViewInit, OnDestroy {
  readonly about = ABOUT;
  readonly profile = PROFILE;
  readonly avatar = 'assets/images/avatar.webp';
  readonly headingLines = ['The Person', 'Behind the Code'];

  @ViewChild('intro', { static: true }) private intro!: ElementRef<HTMLElement>;
  @ViewChild('builtOn', { static: true }) private builtOn!: ElementRef<HTMLElement>;
  @ViewChildren('highlight') private highlights!: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('markerBar') private markerBars!: QueryList<ElementRef<HTMLElement>>;

  private ctx?: gsap.Context;

  constructor(
    private readonly zone: NgZone,
    private readonly media: MediaService,
  ) {}

  ngAfterViewInit(): void {
    const highlights = this.highlights.map((ref) => ref.nativeElement);
    const bars = this.markerBars.map((ref) => ref.nativeElement);

    if (this.media.reducedMotion.matches) {
      gsap.set(bars, { scaleX: 1 });
      return;
    }

    this.zone.runOutsideAngular(() => {
      this.ctx = gsap.context(() => {
        // Animating from `inherit` dips through transparent to terracotta and settles on
        // the paragraph colour — the same GSAP call (and result) as the reference.
        ScrollTrigger.create({
          trigger: this.intro.nativeElement,
          start: 'top 80%',
          once: true,
          onEnter: () =>
            gsap.fromTo(
              highlights,
              { color: 'inherit', scale: 1 },
              { color: '#c8602a', scale: 1.02, duration: 0.3, delay: 0.9, stagger: 0.08, ease: 'power2.out', yoyo: true, repeat: 1 },
            ),
        });
        gsap.fromTo(
          bars,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 0.55,
            ease: 'power3.out',
            stagger: 0.22,
            scrollTrigger: { trigger: this.builtOn.nativeElement, start: 'top 88%', once: true },
          },
        );
      });
    });
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
  }
}
