import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  public activeNotification = new Subject<{
    message: string;
    level?: 'is-danger' | 'is-warning' | 'is-success';
    pipelines?: number;
    mergerequests?: number;
  }>();
  public activeNotification$ = this.activeNotification.asObservable();

  public pipelinesNotificationSource = new Subject<{
    message: string;
    level?: 'is-danger' | 'is-warning' | 'is-success';
    pipelines?: number;
  }>();

  public pipeLinesNotification$ = this.pipelinesNotificationSource.asObservable();

  public mergeReqNotificationSource = new Subject<{
    message: string;
    level?: 'is-danger' | 'is-warning' | 'is-success';
    mergerequests?: number;
  }>();

  public mergeReqNotification$ = this.mergeReqNotificationSource.asObservable();

  constructor() {}

  activateNotification(notification: any) {
    console.log('notificationService activateNotification: ', notification);
    this.activeNotification.next(notification);
  }

  announcePipelines(notification: any) {
    console.log('notificationService announcePipelines: ', notification);
    this.pipelinesNotificationSource.next(notification);
  }

  announceMergeRequests(notification: any) {
    console.log('notificationService announceMergeRequests: ', notification);
    this.mergeReqNotificationSource.next(notification);
  }
}
