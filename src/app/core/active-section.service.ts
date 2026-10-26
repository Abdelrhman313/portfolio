import { Injectable } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged } from 'rxjs';

export type SectionId = 'hero' | 'about' | 'experience' | 'projects' | 'skills' | 'contact';

export const SECTION_IDS: SectionId[] = ['hero', 'about', 'experience', 'projects', 'skills', 'contact'];

/** The section the nav highlights: the last one to cross its visibility threshold. */
@Injectable({ providedIn: 'root' })
export class ActiveSectionService {
  private readonly current = new BehaviorSubject<SectionId>('hero');
  readonly active$ = this.current.pipe(distinctUntilChanged());

  set(id: SectionId): void {
    this.current.next(id);
  }
}
