import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { Toast, ToastService } from '../../core/toast.service';
import { IconComponent } from '../../shared/icon/icon.component';

const LIFETIME_MS = 4000;
const TRANSITION_MS = 400;

interface ToastView extends Toast {
  shown: boolean;
  timer?: number;
  remaining: number;
  startedAt: number;
}

/** Bottom-right notifications styled after the reference's dark sonner theme. */
@Component({
  selector: 'app-toaster',
  standalone: true,
  imports: [NgFor, NgIf, IconComponent],
  templateUrl: './toaster.component.html',
  styleUrls: ['./toaster.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToasterComponent implements OnInit, OnDestroy {
  views: ToastView[] = [];
  private subscription?: Subscription;

  constructor(
    private readonly toasts: ToastService,
    private readonly zone: NgZone,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.subscription = this.toasts.toasts$.subscribe((list) => {
      this.views = this.views.filter((view) => list.some((toast) => toast.id === view.id));
      for (const toast of list) {
        if (this.views.some((view) => view.id === toast.id)) continue;
        const view: ToastView = { ...toast, shown: false, remaining: LIFETIME_MS, startedAt: 0 };
        this.views.push(view);
        this.startTimer(view);
        // Mount off-screen first so the slide-in transition runs.
        requestAnimationFrame(() => this.zone.run(() => this.update(() => (view.shown = true))));
      }
      this.cdr.markForCheck();
    });
  }

  trackById(_: number, view: ToastView): number {
    return view.id;
  }

  pause(view: ToastView): void {
    clearTimeout(view.timer);
    view.remaining -= Date.now() - view.startedAt;
  }

  resume(view: ToastView): void {
    view.remaining = Math.max(view.remaining, 1000);
    this.startTimer(view);
  }

  private startTimer(view: ToastView): void {
    view.startedAt = Date.now();
    view.timer = window.setTimeout(() => this.zone.run(() => this.close(view)), view.remaining);
  }

  private close(view: ToastView): void {
    this.update(() => (view.shown = false));
    window.setTimeout(() => this.toasts.dismiss(view.id), TRANSITION_MS);
  }

  private update(change: () => void): void {
    change();
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.views.forEach((view) => clearTimeout(view.timer));
  }
}
