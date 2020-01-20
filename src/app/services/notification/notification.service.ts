import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  public activeNotification = new Subject<{
    message: string;
    level?: 'is-danger' | 'is-warning' | 'is-success';
  }>();

  constructor() { }
}
