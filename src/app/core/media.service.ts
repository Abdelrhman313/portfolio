import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/** A live `matchMedia` query: `matches` is read synchronously, `changes` replays and follows it. */
export class LiveQuery {
  private readonly state: BehaviorSubject<boolean>;
  readonly changes: Observable<boolean>;

  constructor(query: string) {
    const list = window.matchMedia(query);
    this.state = new BehaviorSubject(list.matches);
    this.changes = this.state.asObservable();
    list.addEventListener('change', (event) => this.state.next(event.matches));
  }

  get matches(): boolean {
    return this.state.value;
  }
}

/** Media queries that switch layout or behaviour, read before first render so nothing flashes. */
@Injectable({ providedIn: 'root' })
export class MediaService {
  readonly reducedMotion = new LiveQuery('(prefers-reduced-motion: reduce)');
  /** md and up: robot in the hero's right column, desktop project rows. */
  readonly desktop = new LiveQuery('(min-width: 768px)');
  /** lg and up: the orbiting skills diagram (chips below). */
  readonly wide = new LiveQuery('(min-width: 1024px)');
  readonly hoverNone = new LiveQuery('(hover: none)');
  /** Checked once, like the reference's custom cursor. */
  readonly coarsePointer = window.matchMedia('(pointer: coarse)').matches;
}
