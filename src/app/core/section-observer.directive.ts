import { AfterViewInit, Directive, ElementRef, EventEmitter, Input, NgZone, OnDestroy, Output } from '@angular/core';

import { ActiveSectionService, SectionId } from './active-section.service';

/** Marks a page section active once `sectionThreshold` of it is in view. */
@Directive({ selector: '[appSection]', standalone: true })
export class SectionObserverDirective implements AfterViewInit, OnDestroy {
  @Input({ required: true }) appSection!: SectionId;
  @Input() sectionThreshold = 0.3;
  /** Emits every time the section crosses its threshold into view. */
  @Output() readonly sectionEnter = new EventEmitter<void>();

  private observer?: IntersectionObserver;

  constructor(
    private readonly host: ElementRef<HTMLElement>,
    private readonly zone: NgZone,
    private readonly activeSection: ActiveSectionService,
  ) {}

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && entry.intersectionRatio >= this.sectionThreshold) {
            this.zone.run(() => {
              this.activeSection.set(this.appSection);
              this.sectionEnter.emit();
            });
          }
        },
        { threshold: this.sectionThreshold },
      );
      this.observer.observe(this.host.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
