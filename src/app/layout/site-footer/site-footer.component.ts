import { NgFor } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  QueryList,
  ViewChildren,
} from '@angular/core';

import { gsap } from '../../core/gsap';
import { Link } from '../../data/portfolio.models';

type Brand = 'github' | 'linkedin' | 'behance' | 'gmail';

interface FooterLink extends Link {
  brand: Brand;
}

// Brand marks (Simple Icons, CC0), drawn on a 24x24 grid.
const BRAND_PATHS: Record<Brand, string> = {
  github:
    'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
  linkedin:
    'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  behance:
    'M16.969 16.927a2.561 2.561 0 0 0 1.901.677 2.501 2.501 0 0 0 1.531-.475c.362-.235.636-.584.779-.99h2.585a5.091 5.091 0 0 1-1.9 2.896 5.292 5.292 0 0 1-3.091.88 5.839 5.839 0 0 1-2.284-.433 4.871 4.871 0 0 1-1.723-1.211 5.657 5.657 0 0 1-1.08-1.874 7.057 7.057 0 0 1-.383-2.393c-.005-.8.129-1.595.396-2.349a5.313 5.313 0 0 1 5.088-3.604 4.87 4.87 0 0 1 2.376.563c.661.362 1.231.87 1.668 1.485a6.2 6.2 0 0 1 .943 2.133c.194.821.263 1.666.205 2.508h-7.699c-.063.79.184 1.574.688 2.187ZM6.947 4.084a8.065 8.065 0 0 1 1.928.198 4.29 4.29 0 0 1 1.49.638c.418.303.748.711.958 1.182.241.586.357 1.217.341 1.851a3.564 3.564 0 0 1-.506 1.958 3.75 3.75 0 0 1-1.503 1.287 3.649 3.649 0 0 1 2.044 1.462c.513.817.774 1.768.75 2.732a4.457 4.457 0 0 1-.461 2.087 4.38 4.38 0 0 1-1.278 1.473 5.647 5.647 0 0 1-1.858.84 8.3 8.3 0 0 1-2.13.276H0V4.084h6.947Zm-.443 15.08a4.024 4.024 0 0 0 .866-.091c.267-.054.52-.159.746-.31.214-.144.389-.338.508-.567a1.987 1.987 0 0 0 .19-.912 1.853 1.853 0 0 0-.618-1.556 2.497 2.497 0 0 0-1.637-.47H3.052v3.906h3.452Zm-.218-6.539a2.02 2.02 0 0 0 1.236-.364c.336-.276.513-.701.475-1.135a1.427 1.427 0 0 0-.168-.719 1.112 1.112 0 0 0-.453-.428 1.926 1.926 0 0 0-.641-.215 3.954 3.954 0 0 0-.75-.063H3.052v2.924h3.234Zm13.256 1.271a2.155 2.155 0 0 0-1.663-.596 2.539 2.539 0 0 0-1.207.247 2.272 2.272 0 0 0-.766.616 2.282 2.282 0 0 0-.411.783c-.075.25-.12.508-.137.766h4.746a3.382 3.382 0 0 0-.562-1.816ZM15.497 5.502h5.946v1.442h-5.946V5.502Z',
  gmail:
    'M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z',
};

const BRAND_COLORS: Record<Brand, string> = {
  github: '#f5f0e8',
  linkedin: '#0a66c2',
  behance: '#1769ff',
  gmail: '#ea4335',
};

@Component({
  selector: 'app-site-footer',
  standalone: true,
  imports: [NgFor],
  templateUrl: './site-footer.component.html',
  styleUrls: ['./site-footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteFooterComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input({ required: true }) socials!: Link[];
  @Input({ required: true }) email!: string;

  readonly year = new Date().getFullYear();
  readonly paths = BRAND_PATHS;
  readonly colors = BRAND_COLORS;
  hovered: string | null = null;

  @ViewChildren('icon') private iconEls!: QueryList<ElementRef<HTMLElement>>;
  private cleanup?: () => void;

  constructor(
    private readonly zone: NgZone,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  links: FooterLink[] = [];

  ngOnChanges(): void {
    const brand = (label: string) => label.toLowerCase() as Brand;
    this.links = [
      ...this.socials.map((link) => ({ ...link, brand: brand(link.label) })),
      { label: 'Gmail', href: `mailto:${this.email}`, brand: 'gmail' },
    ];
  }

  ngAfterViewInit(): void {
    this.iconEls.forEach(({ nativeElement }) => gsap.set(nativeElement, { y: -40, opacity: 0, filter: 'blur(2px)' }));
    // Any click anywhere gives the floating icon a little pulse.
    this.zone.runOutsideAngular(() => {
      const pulse = () => {
        const icon = this.iconFor(this.hovered);
        if (icon) gsap.fromTo(icon, { scale: 1 }, { keyframes: { scale: [1, 1.3, 1] }, duration: 0.3, ease: 'none' });
      };
      window.addEventListener('click', pulse);
      this.cleanup = () => window.removeEventListener('click', pulse);
    });
  }

  enter(label: string): void {
    const previous = this.hovered;
    this.hovered = label;
    this.cdr.markForCheck();
    if (previous && previous !== label) this.hideIcon(previous);
    const icon = this.iconFor(label);
    if (!icon) return;
    this.zone.runOutsideAngular(() =>
      gsap.fromTo(
        icon,
        { y: -40, opacity: 0, filter: 'blur(2px)', rotation: Math.random() * 20 - 10 },
        { y: -50, opacity: 1, filter: 'blur(0px)', duration: 0.2, ease: 'power1.inOut', overwrite: true },
      ),
    );
  }

  leave(label: string): void {
    if (this.hovered === label) {
      this.hovered = null;
      this.cdr.markForCheck();
    }
    this.hideIcon(label);
  }

  private hideIcon(label: string): void {
    const icon = this.iconFor(label);
    if (icon) {
      this.zone.runOutsideAngular(() =>
        gsap.to(icon, { y: -40, opacity: 0, filter: 'blur(2px)', duration: 0.2, ease: 'power1.inOut', overwrite: true }),
      );
    }
  }

  private iconFor(label: string | null): HTMLElement | undefined {
    const index = this.links.findIndex((link) => link.label === label);
    return index < 0 ? undefined : this.iconEls.get(index)?.nativeElement;
  }

  ngOnDestroy(): void {
    this.cleanup?.();
  }
}
