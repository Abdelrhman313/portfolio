import { NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  ViewChild,
} from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn } from '@angular/forms';

import { gsap } from '../../core/gsap';
import { MediaService } from '../../core/media.service';
import { SectionObserverDirective } from '../../core/section-observer.directive';
import { ToastService } from '../../core/toast.service';
import { PROFILE } from '../../data/portfolio.data';
import { SITE_CONFIG } from '../../data/site.config';
import { IconComponent } from '../../shared/icon/icon.component';
import { MagneticDirective } from '../../shared/magnetic.directive';
import { SectionHeadingComponent } from '../../shared/section-heading/section-heading.component';
import { TextRevealDirective } from '../../shared/text-reveal.directive';

const EMAIL_PATTERN = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9-]*\.)+[A-Za-z]{2,}$/;

/** Same rules as the reference: plain length checks (empty fails too) and its email pattern. */
function minLength(length: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => (String(control.value ?? '').length >= length ? null : { minLength: true });
}

function email(control: AbstractControl): ValidationErrors | null {
  return EMAIL_PATTERN.test(String(control.value ?? '')) ? null : { email: true };
}

type FieldName = 'name' | 'email' | 'message';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [NgFor, NgIf, NgTemplateOutlet, ReactiveFormsModule, IconComponent, MagneticDirective, SectionHeadingComponent, SectionObserverDirective, TextRevealDirective],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactComponent {
  readonly profile = PROFILE;
  readonly headingLines = ["Let's Build", 'Something'];
  readonly hoverNone: boolean;
  readonly errors: Record<FieldName, string> = {
    name: 'Name must be at least 2 characters',
    email: 'Enter a valid email address',
    message: 'Message must be at least 10 characters',
  };

  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: minLength(2) }),
    email: new FormControl('', { nonNullable: true, validators: email }),
    message: new FormControl('', { nonNullable: true, validators: minLength(10) }),
  });

  /** Errors only show once the visitor has tried to send. */
  submitted = false;
  sending = false;
  done: { title: string; text: string; viaEmailApp: boolean } | null = null;

  @ViewChild('stage', { static: true }) private stage!: ElementRef<HTMLElement>;
  @ViewChild('formEl', { static: true }) private formEl!: ElementRef<HTMLFormElement>;
  @ViewChild('doneEl', { static: true }) private doneEl!: ElementRef<HTMLElement>;

  constructor(
    private readonly zone: NgZone,
    private readonly cdr: ChangeDetectorRef,
    private readonly media: MediaService,
    private readonly toasts: ToastService,
  ) {
    this.hoverNone = media.hoverNone.matches;
  }

  showError(field: FieldName): boolean {
    return this.submitted && this.form.controls[field].invalid;
  }

  async submit(): Promise<void> {
    this.submitted = true;
    if (this.form.invalid) {
      const first = (['name', 'email', 'message'] as FieldName[]).find((field) => this.form.controls[field].invalid);
      this.formEl.nativeElement.querySelector<HTMLElement>(`#${first}`)?.focus();
      return;
    }

    const { name, email: from, message } = this.form.getRawValue();
    if (!SITE_CONFIG.contactEndpoint) {
      // No backend: hand the message to the visitor's email app instead of pretending to send it.
      const subject = `Portfolio enquiry from ${name}`;
      const body = `${message}\n\n— ${name} (${from})`;
      window.location.href = `mailto:${this.profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      this.finish({
        title: 'Almost there.',
        text: 'Your email app should open with the message ready — just press send.',
        viaEmailApp: true,
      });
      return;
    }

    this.sending = true;
    this.form.disable();
    try {
      const response = await fetch(SITE_CONFIG.contactEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name, email: from, message }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      this.finish({ title: 'Message sent.', text: "I'll be in touch soon.", viaEmailApp: false });
    } catch {
      this.toasts.error("Couldn't send your message. Please try emailing directly.");
      this.sending = false;
      this.form.enable();
      this.cdr.markForCheck();
    }
  }

  /** Swap the form for the confirmation panel, keeping the column's height so nothing jumps. */
  private finish(done: { title: string; text: string; viaEmailApp: boolean }): void {
    this.done = done;
    this.cdr.markForCheck();
    const stage = this.stage.nativeElement;
    const form = this.formEl.nativeElement;
    const panel = this.doneEl.nativeElement;
    stage.style.minHeight = `${form.offsetHeight}px`;

    if (this.media.reducedMotion.matches) {
      form.style.display = 'none';
      panel.style.opacity = '1';
      panel.style.pointerEvents = 'auto';
      return;
    }
    this.zone.runOutsideAngular(() => {
      gsap.to(form, {
        opacity: 0,
        y: -20,
        duration: 0.5,
        ease: 'power3.out',
        onComplete: () => {
          form.style.display = 'none';
          panel.style.pointerEvents = 'auto';
          gsap.fromTo(panel, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
        },
      });
    });
  }
}
