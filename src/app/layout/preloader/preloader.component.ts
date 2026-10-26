import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';

import { gsap } from '../../core/gsap';
import { IntroService } from '../../core/intro.service';
import { SmoothScrollService } from '../../core/smooth-scroll.service';

const TITLE = 'The Craftsman’s Journal';
const MIN_DURATION_MS = 5500;

/** First-visit curtain: plays its intro, waits for the page to load, then lifts away. */
@Component({
  selector: 'app-preloader',
  standalone: true,
  templateUrl: './preloader.component.html',
  styleUrls: ['./preloader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreloaderComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) initials!: string;
  @Input({ required: true }) avatar!: string;
  @Output() readonly finished = new EventEmitter<void>();

  @ViewChild('root', { static: true }) private root!: ElementRef<HTMLElement>;
  @ViewChild('ring', { static: true }) private ring!: ElementRef<HTMLElement>;
  @ViewChild('ringDash', { static: true }) private ringDash!: ElementRef<HTMLElement>;
  @ViewChild('monogram', { static: true }) private monogram!: ElementRef<HTMLElement>;
  @ViewChild('rule', { static: true }) private rule!: ElementRef<HTMLElement>;
  @ViewChild('title', { static: true }) private title!: ElementRef<HTMLElement>;
  @ViewChild('subtitle', { static: true }) private subtitle!: ElementRef<HTMLElement>;
  @ViewChild('progressRow', { static: true }) private progressRow!: ElementRef<HTMLElement>;
  @ViewChild('bar', { static: true }) private bar!: ElementRef<HTMLElement>;
  @ViewChild('percent', { static: true }) private percent!: ElementRef<HTMLElement>;

  private destroyed = false;
  private timeline?: gsap.core.Timeline;
  private spin?: gsap.core.Tween;

  constructor(
    private readonly zone: NgZone,
    private readonly intro: IntroService,
    private readonly smoothScroll: SmoothScrollService,
  ) {}

  ngAfterViewInit(): void {
    document.body.style.overflow = 'hidden';
    this.smoothScroll.stop();
    this.zone.runOutsideAngular(() => this.play());
  }

  private play(): void {
    const ring = this.ring.nativeElement;
    const dash = this.ringDash.nativeElement;
    const monogram = this.monogram.nativeElement;
    const rule = this.rule.nativeElement;
    const title = this.title.nativeElement;
    const subtitle = this.subtitle.nativeElement;
    const row = this.progressRow.nativeElement;
    const bar = this.bar.nativeElement;
    const percent = this.percent.nativeElement;

    const loaded = new Promise<void>((resolve) =>
      document.readyState === 'complete' ? resolve() : window.addEventListener('load', () => resolve(), { once: true }),
    );
    const minimum = new Promise<void>((resolve) => setTimeout(resolve, MIN_DURATION_MS));

    gsap.set(ring, { opacity: 0, scale: 0.8 });
    gsap.set(monogram, { opacity: 0, scale: 0.85 });
    gsap.set(rule, { opacity: 0, scaleX: 0, transformOrigin: 'left center' });
    gsap.set([subtitle, row], { opacity: 0 });
    gsap.set(bar, { scaleX: 0, transformOrigin: 'left center' });
    title.innerHTML = Array.from(TITLE)
      .map((c) => `<span style="display:inline-block;opacity:0;transform:translateY(22px)">${c === ' ' ? '&nbsp;' : c}</span>`)
      .join('');
    gsap.set(title, { opacity: 1 });

    this.spin = gsap.to(dash, { rotation: '+=360', duration: 3.5, ease: 'none', repeat: -1 });

    const counter = { value: 0 };
    const showCount = () => {
      percent.textContent = `${Math.round(counter.value)}%`;
    };
    const tl = gsap.timeline();
    tl.to(ring, { opacity: 1, scale: 1, duration: 0.7, ease: 'power2.out' }, 0.3)
      .to(monogram, { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out' }, 1)
      .to(rule, { opacity: 1, scaleX: 1, duration: 0.7, ease: 'power2.inOut' }, 1.6)
      .to(title.querySelectorAll('span'), { opacity: 1, y: 0, duration: 0.6, stagger: 0.04, ease: 'power3.out' }, 2.2)
      .to(subtitle, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 3.4)
      .to(row, { opacity: 1, duration: 0.3 }, 3.7)
      .to(bar, { scaleX: 0.45, duration: 1.1, ease: 'power2.out' }, 3.7)
      .to(counter, { value: 45, duration: 1.1, ease: 'power2.out', onUpdate: showCount }, 3.7)
      .to(bar, { scaleX: 0.88, duration: 2.4, ease: 'sine.inOut' })
      .to(counter, { value: 88, duration: 2.4, ease: 'sine.inOut', onUpdate: showCount }, '<')
      .add(() => {
        Promise.all([loaded, minimum]).then(() => {
          if (!this.destroyed) this.finish(counter, showCount, [ring, monogram, rule, title, subtitle, row]);
        });
      });
    this.timeline = tl;
  }

  private finish(counter: { value: number }, showCount: () => void, content: HTMLElement[]): void {
    const dash = this.ringDash.nativeElement;
    gsap.to(this.bar.nativeElement, { scaleX: 1, duration: 0.5, ease: 'power2.in' });
    gsap.to(counter, {
      value: 100,
      duration: 0.5,
      ease: 'power2.in',
      onUpdate: showCount,
      onComplete: () => {
        this.percent.nativeElement.textContent = '100%';
      },
    });
    // Let the dashed ring finish its turn and settle into a solid ring.
    gsap.delayedCall(0.35, () => {
      this.spin?.kill();
      const rotation = Number(gsap.getProperty(dash, 'rotation'));
      gsap.to(dash, {
        rotation: 360 * Math.ceil(rotation / 360),
        duration: 0.7,
        ease: 'power3.out',
        onComplete: () => {
          dash.style.borderStyle = 'solid';
        },
      });
    });
    gsap.delayedCall(1, () => {
      gsap.to(content, {
        opacity: 0,
        duration: 0.45,
        ease: 'power2.in',
        onComplete: () => {
          this.intro.release();
          this.smoothScroll.start();
          gsap.to(this.root.nativeElement, {
            y: '-100vh',
            duration: 1,
            ease: 'power4.inOut',
            onComplete: () => {
              this.intro.complete();
              document.body.style.overflow = '';
              this.zone.run(() => this.finished.emit());
            },
          });
        },
      });
    });
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.timeline?.kill();
    this.spin?.kill();
    document.body.style.overflow = '';
  }
}
