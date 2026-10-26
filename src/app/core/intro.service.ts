import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';

import { MediaService } from './media.service';

const STORAGE_KEY = 'journal-loaded';

function readFlag(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

function writeFlag(): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, '1');
  } catch {
    // Storage can be unavailable (private mode); the preloader simply runs again.
  }
}

/**
 * Coordinates the first-visit preloader with the hero entrance: the hero waits for
 * `ready$`, which fires immediately when the preloader is skipped.
 */
@Injectable({ providedIn: 'root' })
export class IntroService {
  /** The preloader runs once per tab session, and never with reduced motion. */
  readonly showPreloader: boolean;

  private readonly ready = new ReplaySubject<void>(1);
  readonly ready$: Observable<void> = this.ready.asObservable();

  constructor(media: MediaService) {
    const seen = readFlag();
    this.showPreloader = !seen && !media.reducedMotion.matches;
    if (!this.showPreloader) {
      // Unlike the reference, reduced motion also releases the hero here, so it never stays blank.
      writeFlag();
      this.ready.next();
    }
  }

  /** The preloader content has faded out and the curtain starts lifting. */
  release(): void {
    this.ready.next();
  }

  /** The curtain is gone; later visits in this tab skip the preloader. */
  complete(): void {
    writeFlag();
  }
}
