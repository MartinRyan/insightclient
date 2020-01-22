import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

import { NotificationService } from './../../services/notification/notification.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.styl']
})
export class NotificationComponent implements OnInit {
  public notification: {
    message: string;
    level?: 'is-danger' | 'is-warning' | 'is-success';
    pipelines?: number;
  } = null;
  private subscriptions: Array<any> = [];

  constructor(
    private notificationService: NotificationService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    const notifications$ = this.notificationService.activeNotification.subscribe(
      notification => {
        this.subscriptions.push(notifications$);
        this.notification = notification;
        this.spinner.hide();
        console.log(
          'notification component: ',
          notification.message,
          ' notification.pipelines : ',
          notification.pipelines,
          ' notification.mergerequests ',
          notification.mergerequests,
          ' notification.level: ',
          notification.level
        );
      }
    );
  }

  onDestroy() {
    this.clearSubscriptions();
  }

  private clearSubscriptions() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }
}
