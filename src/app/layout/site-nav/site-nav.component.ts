import { NgFor } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { Subscription } from 'rxjs';

import { ActiveSectionService, SectionId } from '../../core/active-section.service';
import { gsap } from '../../core/gsap';
import { cubicBezier, EASE_DEFAULT, FLIP_SPRING, GLOW_IN_SPRING, GLOW_OUT_SPRING, INDICATOR_SPRING } from '../../core/springs';
import { IconComponent, IconName } from '../../shared/icon/icon.component';

interface NavItem {
  id: SectionId;
  label: string;
  icon: IconName;
}

const GLOW_OUT_OPACITY_EASE = cubicBezier(0.25, 0.1, 0.35, 1);

@Component({
  selector: 'app-site-nav',
  standalone: true,
  imports: [NgFor, IconComponent],
  templateUrl: './site-nav.component.html',
  styleUrls: ['./site-nav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteNavComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) initials!: string;

  readonly items: NavItem[] = [
    { id: 'about', label: 'About', icon: 'user' },
    { id: 'experience', label: 'Experience', icon: 'briefcase' },
    { id: 'projects', label: 'Projects', icon: 'folder-kanban' },
    { id: 'skills', label: 'Skills', icon: 'code-xml' },
    { id: 'contact', label: 'Contact', icon: 'mail' },
  ];

  active: SectionId = 'hero';

  @ViewChild('nav', { static: true }) private nav!: ElementRef<HTMLElement>;
  @ViewChildren('item') private itemEls!: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('indicator') private indicatorEls!: QueryList<ElementRef<HTMLElement>>;

  private subscription?: Subscription;
  private cleanups: Array<() => void> = [];

  constructor(
    private readonly zone: NgZone,
    private readonly cdr: ChangeDetectorRef,
    private readonly activeSection: ActiveSectionService,
  ) {}

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.itemEls.forEach(({ nativeElement }) => this.bindFlip(nativeElement));

      const nav = this.nav.nativeElement;
      const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 48);
      window.addEventListener('scroll', onScroll, { passive: true });
      this.cleanups.push(() => window.removeEventListener('scroll', onScroll));
    });

    this.subscription = this.activeSection.active$.subscribe((id) => {
      const previous = this.active;
      this.active = id;
      this.cdr.markForCheck();
      this.zone.runOutsideAngular(() => this.moveIndicator(previous, id));
    });
  }

  /** Hovering flips the label up like a rolling sign while a glow blooms behind it. */
  private bindFlip(item: HTMLElement): void {
    const front = item.querySelector<HTMLElement>('.nav__link--front')!;
    const back = item.querySelector<HTMLElement>('.nav__link--back')!;
    const glow = item.querySelector<HTMLElement>('.nav__glow')!;
    gsap.set(front, { rotateX: 0, opacity: 1 });
    gsap.set(back, { rotateX: 90, opacity: 0 });
    gsap.set(glow, { opacity: 0, scale: 0.8 });

    const enter = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      gsap.to(front, { rotateX: -90, opacity: 0, ...FLIP_SPRING, overwrite: true });
      gsap.to(back, { rotateX: 0, opacity: 1, ...FLIP_SPRING, overwrite: true });
      gsap.to(glow, { opacity: 1, duration: 0.5, ease: EASE_DEFAULT, overwrite: 'auto' });
      gsap.to(glow, { scale: 2, ...GLOW_IN_SPRING, overwrite: 'auto' });
    };
    const leave = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      gsap.to(front, { rotateX: 0, opacity: 1, ...FLIP_SPRING, overwrite: true });
      gsap.to(back, { rotateX: 90, opacity: 0, ...FLIP_SPRING, overwrite: true });
      gsap.to(glow, { opacity: 0, duration: 0.3, ease: GLOW_OUT_OPACITY_EASE, overwrite: 'auto' });
      gsap.to(glow, { scale: 0.8, ...GLOW_OUT_SPRING, overwrite: 'auto' });
    };
    item.addEventListener('pointerenter', enter);
    item.addEventListener('pointerleave', leave);
    this.cleanups.push(() => {
      item.removeEventListener('pointerenter', enter);
      item.removeEventListener('pointerleave', leave);
      gsap.killTweensOf([front, back, glow]);
    });
  }

  /** The indicator pops in under the first active item, then crossfades in place between items. */
  private moveIndicator(from: SectionId, to: SectionId): void {
    const indicator = (id: SectionId) => {
      const index = this.items.findIndex((item) => item.id === id);
      return index < 0 ? undefined : this.indicatorEls.get(index)?.nativeElement;
    };
    const previous = indicator(from);
    const next = indicator(to);

    if (previous && next) {
      gsap.to(previous, { opacity: 0, ...INDICATOR_SPRING, overwrite: true });
      gsap.set(next, { scaleX: 1 });
      gsap.to(next, { opacity: 1, ...INDICATOR_SPRING, overwrite: true });
    } else if (next) {
      gsap.fromTo(next, { opacity: 0, scaleX: 0 }, { opacity: 1, scaleX: 1, ...INDICATOR_SPRING, overwrite: true });
    } else if (previous) {
      gsap.to(previous, { opacity: 0, scaleX: 0, ...INDICATOR_SPRING, overwrite: true });
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.cleanups.forEach((cleanup) => cleanup());
  }
}
