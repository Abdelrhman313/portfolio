import { NgIf } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  ViewChild,
} from '@angular/core';

import { gsap } from '../../core/gsap';
import { MediaService } from '../../core/media.service';

/** Square portrait with an initials placeholder that shows until (or unless) the photo loads. */
@Component({
  selector: 'app-avatar-card',
  standalone: true,
  imports: [NgIf],
  template: `
    <div class="avatar" #card>
      <div class="avatar__placeholder" [attr.aria-hidden]="loaded">
        <span>{{ initials }}</span>
      </div>
      <img
        *ngIf="!failed"
        class="avatar__img"
        [class.is-loaded]="loaded"
        [src]="src"
        [alt]="alt"
        width="400"
        height="400"
        loading="lazy"
        decoding="async"
        (load)="loaded = true"
        (error)="failed = true"
      />
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        max-width: 400px;
      }
      .avatar {
        position: relative;
        width: 100%;
        aspect-ratio: 1 / 1;
        overflow: hidden;
        border-radius: 14.4px;
      }
      .avatar__placeholder {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #2a3240;
      }
      .avatar__placeholder span {
        font-family: var(--font-display);
        font-size: 72px;
        line-height: 1;
        font-weight: 700;
        color: #c8602a;
        user-select: none;
      }
      .avatar__img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        opacity: 0;
        transition: opacity 0.4s ease;
      }
      .avatar__img.is-loaded {
        opacity: 1;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarCardComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) src!: string;
  @Input({ required: true }) alt!: string;
  @Input({ required: true }) initials!: string;

  loaded = false;
  failed = false;

  @ViewChild('card', { static: true }) private card!: ElementRef<HTMLElement>;
  private ctx?: gsap.Context;

  constructor(
    private readonly zone: NgZone,
    private readonly media: MediaService,
  ) {}

  ngAfterViewInit(): void {
    const card = this.card.nativeElement;
    if (this.media.reducedMotion.matches) return;
    this.zone.runOutsideAngular(() => {
      this.ctx = gsap.context(() => {
        gsap.fromTo(
          card,
          { y: 32, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: card, start: 'top 75%' } },
        );
      });
    });
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
  }
}
