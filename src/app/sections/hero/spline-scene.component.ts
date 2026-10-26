import { NgIf } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import type { Application } from '@splinetool/runtime';

/** Lazily loads the Spline runtime (its own chunk) and renders a scene on a transparent canvas. */
@Component({
  selector: 'app-spline-scene',
  standalone: true,
  imports: [NgIf],
  template: `
    <div class="fallback" *ngIf="!runtimeLoaded && !failed"><span class="fallback__dot"></span></div>
    <div class="host">
      <canvas #canvas [style.display]="sceneLoaded ? 'block' : 'none'"></canvas>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }
      .fallback {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
      }
      .fallback__dot {
        width: 12px;
        height: 12px;
        border-radius: 9999px;
        background: #c8602a;
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
      .host {
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SplineSceneComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) scene!: string;

  runtimeLoaded = false;
  sceneLoaded = false;
  failed = false;

  @ViewChild('canvas', { static: true }) private canvas!: ElementRef<HTMLCanvasElement>;
  private app?: Application;
  private destroyed = false;

  constructor(
    private readonly zone: NgZone,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => void this.load());
  }

  private async load(): Promise<void> {
    try {
      const { Application } = await import('@splinetool/runtime');
      if (this.destroyed) return;
      this.zone.run(() => this.mark(() => (this.runtimeLoaded = true)));

      this.app = new Application(this.canvas.nativeElement, { renderOnDemand: true });
      await this.app.load(this.scene);
      if (this.destroyed) return;
      this.app.setBackgroundColor('transparent');
      this.zone.run(() => this.mark(() => (this.sceneLoaded = true)));
    } catch {
      // Network or WebGL failure: drop the loading dot and leave the column empty rather than breaking the hero.
      if (!this.destroyed) this.zone.run(() => this.mark(() => (this.failed = true)));
    }
  }

  private mark(change: () => void): void {
    change();
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.app?.dispose();
  }
}
