import { Component, OnInit } from '@angular/core';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition, MatSnackBarConfig } from '@angular/material/snack-bar';
import { NgxSpinnerService } from 'ngx-spinner';
import { Message } from 'primeng/api';

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
    pipelines?: any;
  } = null;
  private subscriptions: Array<any> = [];
  msgs: Message[] = [];
  message = 'Snack Bar opened.';
  actionButtonLabel = 'dismiss';
  action = 'open';
  setAutoHide = true;
  autoHide = 5000;
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  config = new MatSnackBarConfig();

  constructor(
    private notificationService: NotificationService,
    private spinner: NgxSpinnerService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.config.verticalPosition = this.verticalPosition;
    this.config.horizontalPosition = this.horizontalPosition;
    this.config.duration = this.setAutoHide ? this.autoHide : 0;
    // this.openSnackBar(this.message, this.action);
    const notifications$ = this.notificationService.activeNotification$.subscribe(
      notification => {
        this.subscriptions.push(notifications$);
        this.notification = notification;
        this.spinner.hide();
        this.openSnackBar(notification.message, this.action);
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
    // this.openSnackBar(this.message, this.action);
  }

  onDestroy() {
    this.clearSubscriptions();
    // this.clear();
  }

  private clearSubscriptions() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action ? this.actionButtonLabel : undefined, this.config);
  }

  // showSuccess() {
  //   this.msgs = [];
  //   this.msgs.push({
  //     severity: 'success',
  //     summary: 'Success Message',
  //     detail: 'Order submitted'
  //   });
  // }

  // showInfo() {
  //   this.msgs = [];
  //   this.msgs.push({
  //     severity: 'info',
  //     summary: 'Info Message',
  //     detail: 'PrimeNG rocks'
  //   });
  // }

  // showWarn() {
  //   this.msgs = [];
  //   this.msgs.push({
  //     severity: 'warn',
  //     summary: 'Warn Message',
  //     detail: 'There are unsaved changes'
  //   });
  // }

  // showError() {
  //   this.msgs = [];
  //   this.msgs.push({
  //     severity: 'error',
  //     summary: 'Error Message',
  //     detail: 'Validation failed'
  //   });
  // }

  // showMultiple() {
  //   this.msgs = [];
  //   this.msgs.push({
  //     severity: 'info',
  //     summary: 'Message 1',
  //     detail: 'PrimeNG rocks'
  //   });
  //   this.msgs.push({
  //     severity: ' info',
  //     summary: 'Message 2',
  //     detail: 'PrimeUI rocks'
  //   });
  //   this.msgs.push({
  //     severity: 'info',
  //     summary: 'Message 3',
  //     detail: 'PrimeFaces rocks'
  //   });
  // }

  // clear() {
  //   this.msgs = [];
  // }
}
