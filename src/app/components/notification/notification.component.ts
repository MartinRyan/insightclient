import { Component, OnInit } from '@angular/core';
import { NotificationService } from './../../services/notification/notification.service';
import { Subscription } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';

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

  constructor(private notificationService: NotificationService, private spinner: NgxSpinnerService) { }

  ngOnInit() {
    const notifications$ = this.notificationService.activeNotification.subscribe(notif => {
      this.subscriptions.push(notifications$);
      this.notification = notif;
      this.spinner.hide();
      console.log('notification component: ', notif.message, ' : ', notif.pipelines );
    });
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

