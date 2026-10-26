import { NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
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
import { Subscription } from 'rxjs';

import { gsap, ScrollTrigger } from '../../core/gsap';
import { MediaService } from '../../core/media.service';
import { SectionObserverDirective } from '../../core/section-observer.directive';
import { FEATURED_PROJECT, PROJECTS } from '../../data/portfolio.data';
import { Project, TechTag } from '../../data/portfolio.models';
import { IconComponent } from '../../shared/icon/icon.component';
import { MagneticDirective } from '../../shared/magnetic.directive';
import { SectionHeadingComponent } from '../../shared/section-heading/section-heading.component';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [NgFor, NgIf, NgTemplateOutlet, IconComponent, MagneticDirective, SectionHeadingComponent, SectionObserverDirective],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsComponent implements AfterViewInit, OnDestroy {
  readonly featured = FEATURED_PROJECT;
  readonly projects = PROJECTS;
  readonly headingLines = ['Selected', 'Projects'];
  readonly hoverNone: boolean;

  isDesktop: boolean;

  @ViewChild('featuredWrap', { static: true }) private featuredWrap!: ElementRef<HTMLElement>;
  @ViewChildren('row') private rowEls!: QueryList<ElementRef<HTMLElement>>;

  private readonly subscriptions = new Subscription();
  private ctx?: gsap.Context;
  private rowsCtx?: gsap.Context;

  constructor(
    private readonly zone: NgZone,
    private readonly cdr: ChangeDetectorRef,
    private readonly media: MediaService,
  ) {
    this.isDesktop = media.desktop.matches;
    // Like the reference, the magnetic wrapper only exists on hover-capable devices.
    this.hoverNone = media.hoverNone.matches;
  }

  index(n: number): string {
    return String(n).padStart(2, '0');
  }

  monogram(project: Project): string {
    return project.title
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  }

  /** Tag pill colours: the colour itself plus two hex-alpha tints. */
  pill(tag: TechTag, background: string, border: string): Record<string, string> {
    return { color: tag.color, background: tag.color + background, 'border-color': tag.color + border };
  }

  ngAfterViewInit(): void {
    const reducedMotion = this.media.reducedMotion.matches;
    const featured = this.featuredWrap.nativeElement;

    if (reducedMotion) {
      gsap.set(featured, { opacity: 1, y: 0 });
    } else {
      this.zone.runOutsideAngular(() => {
        this.ctx = gsap.context(() => {
          gsap.fromTo(
            featured,
            { y: 32, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: featured, start: 'top 82%', once: true } },
          );
        });
      });
    }
    this.animateRows(reducedMotion);

    // Rows switch between the desktop and mobile variants live; animate whichever is rendered.
    this.subscriptions.add(this.rowEls.changes.subscribe(() => this.animateRows(this.media.reducedMotion.matches)));
    this.subscriptions.add(
      this.media.desktop.changes.subscribe((desktop) => {
        if (desktop === this.isDesktop) return;
        this.isDesktop = desktop;
        this.cdr.markForCheck();
      }),
    );
  }

  private animateRows(reducedMotion: boolean): void {
    this.rowsCtx?.revert();
    const rows = this.rowEls.map((ref) => ref.nativeElement);
    if (reducedMotion) {
      gsap.set(rows, { opacity: 1, y: 0 });
      return;
    }
    this.zone.runOutsideAngular(() => {
      this.rowsCtx = gsap.context(() => {
        rows.forEach((row) =>
          gsap.fromTo(
            row,
            { y: 24, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: row, start: 'top 88%', once: true } },
          ),
        );
      });
      ScrollTrigger.refresh();
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.ctx?.revert();
    this.rowsCtx?.revert();
  }
}
