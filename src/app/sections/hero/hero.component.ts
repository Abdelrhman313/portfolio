import { NgIf } from '@angular/common';
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
import { Subscription, take } from 'rxjs';

import { gsap } from '../../core/gsap';
import { IntroService } from '../../core/intro.service';
import { MediaService } from '../../core/media.service';
import { SectionObserverDirective } from '../../core/section-observer.directive';
import { PROFILE } from '../../data/portfolio.data';
import { SITE_CONFIG } from '../../data/site.config';
import { IconComponent } from '../../shared/icon/icon.component';
import { splitChars } from '../../shared/split-chars';
import { ShaderBackgroundComponent } from './shader-background.component';
import { SplineSceneComponent } from './spline-scene.component';

type RequestIdle = (callback: () => void) => number;

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [NgIf, IconComponent, SectionObserverDirective, ShaderBackgroundComponent, SplineSceneComponent],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroComponent implements AfterViewInit, OnDestroy {
  readonly profile = PROFILE;
  readonly sceneUrl = SITE_CONFIG.splineScene;
  readonly title = `${PROFILE.displayName}'s Portfolio`;
  /** Shared with the shader, which darkens as the hero scrolls away. */
  readonly scrollProgress = { value: 0 };

  isDesktop: boolean;
  splineReady = false;

  @ViewChild('section', { static: true }) private section!: ElementRef<HTMLElement>;
  @ViewChild('bg', { static: true }) private bg!: ElementRef<HTMLElement>;
  @ViewChild('wrap', { static: true }) private wrap!: ElementRef<HTMLElement>;
  @ViewChild('eyebrow', { static: true }) private eyebrow!: ElementRef<HTMLElement>;
  @ViewChild('sub', { static: true }) private sub!: ElementRef<HTMLElement>;
  @ViewChild('ctas', { static: true }) private ctas!: ElementRef<HTMLElement>;
  @ViewChild('bar', { static: true }) private bar!: ElementRef<HTMLElement>;
  @ViewChild('indicator', { static: true }) private indicator!: ElementRef<HTMLElement>;
  @ViewChild('spotOuter', { static: true }) private spotOuter!: ElementRef<HTMLElement>;
  @ViewChild('spotInner', { static: true }) private spotInner!: ElementRef<HTMLElement>;
  @ViewChildren('titleLine') private titleLines!: QueryList<ElementRef<HTMLElement>>;

  private readonly subscriptions = new Subscription();
  private ctx?: gsap.Context;
  private cleanups: Array<() => void> = [];

  constructor(
    private readonly zone: NgZone,
    private readonly cdr: ChangeDetectorRef,
    private readonly media: MediaService,
    private readonly intro: IntroService,
  ) {
    this.isDesktop = media.desktop.matches;
  }

  ngAfterViewInit(): void {
    const reducedMotion = this.media.reducedMotion.matches;

    this.subscriptions.add(
      this.media.desktop.changes.subscribe((desktop) => {
        this.isDesktop = desktop;
        this.cdr.markForCheck();
      }),
    );

    this.zone.runOutsideAngular(() => {
      this.ctx = gsap.context(() => this.animateBar(reducedMotion), this.section.nativeElement);
      this.bindSpotlight();
      if (!reducedMotion) this.scheduleSpline();
    });

    this.subscriptions.add(
      this.intro.ready$.pipe(take(1)).subscribe(() => this.zone.runOutsideAngular(() => this.ctx?.add(() => this.reveal(reducedMotion)))),
    );
  }

  /** The bottom bar and scroll cue fade in on their own schedule, preloader or not. */
  private animateBar(reducedMotion: boolean): void {
    const indicator = this.indicator.nativeElement;
    gsap.set(indicator, { xPercent: -50 });
    if (reducedMotion) return;
    gsap.from(this.bar.nativeElement, { opacity: 0, y: 6, duration: 0.6, delay: 1.8, ease: 'power3.out' });
    gsap.from(indicator, { opacity: 0, y: 8, duration: 0.6, delay: 1.8, ease: 'power1.out' });
    gsap.to(indicator, { y: 6, duration: 1, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 2.4 });
  }

  private reveal(reducedMotion: boolean): void {
    const bg = this.bg.nativeElement;
    const wrap = this.wrap.nativeElement;

    if (reducedMotion) {
      gsap.set(bg, { opacity: 1 });
      gsap.set(wrap, { opacity: 1, y: 0 });
      this.revealText(reducedMotion);
      return;
    }

    gsap.fromTo(bg, { opacity: 0 }, { opacity: 1, duration: 1, ease: 'power2.out' });
    gsap.fromTo(wrap, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.15 });

    // The copy and robot drift up and dim as the hero scrolls away.
    gsap.fromTo(
      wrap,
      { y: 0, opacity: 1 },
      {
        y: '-8%',
        opacity: 0.7,
        ease: 'none',
        scrollTrigger: {
          trigger: this.section.nativeElement,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.1,
          onUpdate: (self) => (this.scrollProgress.value = self.progress),
        },
      },
    );

    this.revealText(reducedMotion);
  }

  private revealText(reducedMotion: boolean): void {
    const eyebrow = this.eyebrow.nativeElement;
    const sub = this.sub.nativeElement;
    const ctas = this.ctas.nativeElement;
    if (reducedMotion) {
      gsap.set([eyebrow, sub, ctas], { opacity: 1 });
      return;
    }

    // Every title line is split, including the one hidden at this breakpoint, so the
    // stagger keeps the reference's pause before the visible letters start.
    const chars = this.titleLines
      .toArray()
      .flatMap(({ nativeElement }) => splitChars(nativeElement, { wrapWords: nativeElement.classList.contains('hero__line--mobile') }));

    gsap
      .timeline({ delay: 0.5 })
      .from(eyebrow, { y: 8, opacity: 0, duration: 0.5, ease: 'power3.out' })
      .from(chars, { y: '110%', opacity: 0, duration: 0.75, ease: 'power4.out', stagger: 0.035 })
      .from(sub, { y: 24, opacity: 0, duration: 0.7, ease: 'power3.out' }, '-=0.3')
      .from(ctas, { y: 16, opacity: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4');
  }

  /** Mount the robot once the page is idle, as the reference does. */
  private scheduleSpline(): void {
    const timer = setTimeout(() => {
      const requestIdle = (window as Window & { requestIdleCallback?: RequestIdle }).requestIdleCallback;
      const show = () =>
        this.zone.run(() => {
          this.splineReady = true;
          this.cdr.markForCheck();
        });
      if (requestIdle) requestIdle(show);
      else show();
    }, 600);
    this.cleanups.push(() => clearTimeout(timer));
  }

  /** A soft terracotta glow that follows the pointer across the hero on a damped spring. */
  private bindSpotlight(): void {
    const section = this.section.nativeElement;
    const outer = this.spotOuter.nativeElement;
    const inner = this.spotInner.nativeElement;
    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    let vx = 0;
    let vy = 0;
    let last = 0;
    let frame = 0;

    const step = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.064) : 1 / 60;
      last = now;
      vx += (-80 * (x - targetX) - 18 * vx) * dt;
      vy += (-80 * (y - targetY) - 18 * vy) * dt;
      x += vx * dt;
      y += vy * dt;
      outer.style.transform = `translate(${x - 260}px, ${y - 260}px)`;
      inner.style.transform = `translate(${x - 104}px, ${y - 104}px)`;
      const settled = Math.abs(x - targetX) + Math.abs(y - targetY) + Math.abs(vx) + Math.abs(vy) < 0.01;
      frame = settled ? 0 : requestAnimationFrame(step);
      if (settled) last = 0;
    };

    const enter = () => {
      outer.style.opacity = '1';
      inner.style.opacity = '1';
    };
    const leave = () => {
      outer.style.opacity = '0';
      inner.style.opacity = '0';
    };
    const move = (event: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      targetX = event.clientX - rect.left;
      targetY = event.clientY - rect.top;
      if (!frame) frame = requestAnimationFrame(step);
    };

    section.addEventListener('mouseenter', enter);
    section.addEventListener('mouseleave', leave);
    section.addEventListener('mousemove', move);
    this.cleanups.push(() => {
      cancelAnimationFrame(frame);
      section.removeEventListener('mouseenter', enter);
      section.removeEventListener('mouseleave', leave);
      section.removeEventListener('mousemove', move);
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.ctx?.revert();
    this.cleanups.forEach((cleanup) => cleanup());
  }
}
