import { Component, OnInit } from '@angular/core';
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
  } = null;

  constructor(private notificationService: NotificationService) { }

  ngOnInit() {
    this.notificationService.activeNotification.subscribe(notif => {
      this.notification = notif;
    });
  }
}

