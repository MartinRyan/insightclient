import { Injectable } from '@angular/core';
import { of, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  public activeNotification = new Subject<{ message: string; level?: 'is-danger' | 'is-warning' | 'is-success'; pipelines?: number }>();
  public activeNotification$ = this.activeNotification.asObservable();
  private pipeLinesNotificationSource = new Subject<number>();
  public pipeLinesNotification$ = this.pipeLinesNotificationSource.asObservable();

  constructor() {}

  activateNotification(notification: any) {
    console.log('notificationService activateNotification: ', notification);
    this.activeNotification.next(notification);
  }

  announcePipelinesLength(length: number) {
    console.log('notificationService announcePipelinesLength: ', length);
    this.pipeLinesNotificationSource.next(length);
  }
}
