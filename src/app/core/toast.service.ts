import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
}

const MAX_VISIBLE = 3;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  private readonly list = new BehaviorSubject<Toast[]>([]);
  readonly toasts$ = this.list.asObservable();

  error(message: string): void {
    this.list.next([...this.list.value, { id: ++this.nextId, message }].slice(-MAX_VISIBLE));
  }

  dismiss(id: number): void {
    this.list.next(this.list.value.filter((toast) => toast.id !== id));
  }
}
