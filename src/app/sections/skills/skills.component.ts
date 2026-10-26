import { NgFor, NgIf } from '@angular/common';
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
import { combineLatest, Subscription } from 'rxjs';

import { gsap } from '../../core/gsap';
import { MediaService } from '../../core/media.service';
import { SectionObserverDirective } from '../../core/section-observer.directive';
import { BRAND_ICON_PATHS } from '../../data/brand-icons';
import { PROFILE, SKILLS } from '../../data/portfolio.data';
import { Skill } from '../../data/portfolio.models';
import { SectionHeadingComponent } from '../../shared/section-heading/section-heading.component';

interface Ring {
  radius: number;
  /** Seconds per revolution; negative turns counter-clockwise. */
  period: number;
  accent: string;
  skills: Skill[];
}

const BUBBLE = 48;

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [NgFor, NgIf, SectionHeadingComponent, SectionObserverDirective],
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillsComponent implements AfterViewInit, OnDestroy {
  readonly initials = PROFILE.initials;
  readonly skills = SKILLS;
  readonly icons = BRAND_ICON_PATHS;
  readonly headingLines = ['The Tools', 'of the Craft'];
  readonly rings: Ring[] = [
    { radius: 110, period: 18, accent: '#c8602a', skills: SKILLS.filter((s) => s.ring === 'inner') },
    { radius: 190, period: -28, accent: '#60a5fa', skills: SKILLS.filter((s) => s.ring === 'outer') },
  ];
  readonly orbitLabel = `Orbiting skills diagram: ${SKILLS.map((s) => s.name).join(', ')}`;

  /** The orbit needs room and motion; otherwise the skills render as chips. */
  orbitMode: boolean;
  hovered: Skill | null = null;

  @ViewChild('section', { static: true }) private section!: ElementRef<HTMLElement>;
  @ViewChildren('orbit') private orbitEls!: QueryList<ElementRef<HTMLElement>>;

  private readonly subscriptions = new Subscription();
  private ctx?: gsap.Context;
  private orbitCtx?: gsap.Context;
  private stopOrbit?: () => void;

  constructor(
    private readonly zone: NgZone,
    private readonly cdr: ChangeDetectorRef,
    private readonly media: MediaService,
  ) {
    this.orbitMode = media.wide.matches && !media.reducedMotion.matches;
  }

  initialsOf(skill: Skill): string {
    return skill.abbr ?? skill.name.slice(0, 2).toUpperCase();
  }

  ringAccent(skill: Skill): string {
    return skill.ring === 'inner' ? this.rings[0].accent : this.rings[1].accent;
  }

  ngAfterViewInit(): void {
    const section = this.section.nativeElement;
    if (this.media.reducedMotion.matches) {
      section.style.opacity = '1';
    } else {
      // The whole section fades in whichever layout is showing.
      this.zone.runOutsideAngular(() => {
        this.ctx = gsap.context(() => {
          gsap.fromTo(
            section,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 0.8,
              ease: 'power3.out',
              scrollTrigger: { trigger: section, start: 'top 75%', invalidateOnRefresh: true },
            },
          );
        });
      });
    }

    this.startOrbit();
    this.subscriptions.add(this.orbitEls.changes.subscribe(() => this.startOrbit()));
    this.subscriptions.add(
      combineLatest([this.media.wide.changes, this.media.reducedMotion.changes]).subscribe(([wide, reduced]) => {
        const orbit = wide && !reduced;
        if (orbit === this.orbitMode) return;
        this.orbitMode = orbit;
        this.hovered = null;
        this.cdr.markForCheck();
      }),
    );
  }

  setHovered(skill: Skill | null): void {
    this.hovered = skill;
  }

  /** Spins both rings with requestAnimationFrame, pausing while the pointer is over the diagram. */
  private startOrbit(): void {
    this.stopOrbit?.();
    this.orbitCtx?.revert();
    const orbit = this.orbitEls.first?.nativeElement;
    if (!orbit) return;

    this.zone.runOutsideAngular(() => {
      if (!this.media.reducedMotion.matches) {
        this.orbitCtx = gsap.context(() => {
          gsap.fromTo(
            orbit,
            { scale: 0.85 },
            { scale: 1, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: this.section.nativeElement, start: 'top 75%' } },
          );
        });
      }

      const rings = this.rings.map((ring, r) => ({
        ...ring,
        phase: 0,
        bubbles: Array.from(orbit.querySelectorAll<HTMLElement>(`.ring--${r} > .bubble`)),
      }));
      let paused = false;
      let last = 0;
      let frame = 0;

      const place = () =>
        rings.forEach((ring) =>
          ring.bubbles.forEach((bubble, i) => {
            const angle = ring.phase + (i / ring.bubbles.length) * Math.PI * 2;
            const x = ring.radius + ring.radius * Math.cos(angle) - BUBBLE / 2;
            const y = ring.radius + ring.radius * Math.sin(angle) - BUBBLE / 2;
            bubble.style.transform = `translate(${x}px, ${y}px)`;
          }),
        );

      const tick = (now: number) => {
        if (!paused) {
          const dt = last ? (now - last) / 1000 : 0;
          rings.forEach((ring) => (ring.phase += ((Math.PI * 2) / ring.period) * dt));
          place();
        }
        last = now;
        frame = requestAnimationFrame(tick);
      };
      place();
      frame = requestAnimationFrame(tick);

      const pause = () => (paused = true);
      const resume = () => (paused = false);
      orbit.addEventListener('mouseenter', pause);
      orbit.addEventListener('mouseleave', resume);
      this.stopOrbit = () => {
        cancelAnimationFrame(frame);
        orbit.removeEventListener('mouseenter', pause);
        orbit.removeEventListener('mouseleave', resume);
      };
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.stopOrbit?.();
    this.orbitCtx?.revert();
    this.ctx?.revert();
  }
}
