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

  private pipelinesNotificationSource = new Subject<{
    message: string;
    level?: 'is-danger' | 'is-warning' | 'is-success';
    pipelines?: number;
  }>();

  public pipeLinesNotification$ = this.pipelinesNotificationSource.asObservable();

  private mergeReqNotificationSource = new Subject<{
    message: string;
    level?: 'is-danger' | 'is-warning' | 'is-success';
    mergerequests?: number;
  }>();

  public mergeReqNotification$ = this.mergeReqNotificationSource.asObservable();

  constructor() {}

  activateNotification(notification: any) {
    this.activeNotification.next(notification);
  }

  announcePipelines(notification: any) {
    this.pipelinesNotificationSource.next(notification);
  }

  announceMergeRequests(notification: any) {
    this.mergeReqNotificationSource.next(notification);
  }
}
