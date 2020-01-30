import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition, MatSnackBarConfig } from '@angular/material/snack-bar';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Message } from 'primeng/api';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';

import { GitlabApiService } from './../../services/gitlab-api/gitlab-api.service';
import { NotificationService } from './../../services/notification/notification.service';
import { SettingsService } from './../../services/settings/settings.service';

export interface Brand {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.styl'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent implements OnInit {
  // tslint:disable-next-line: variable-name
  private _isVisible: boolean;
  settingsForm: FormGroup;
  public isLoading = false;
  private subscriptions: Array<any> = [];
  public timeRangeDays: Array<number> = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 21, 28, 31, 84, 365];
  public perpageArray: Array<number> = [2, 4, 6, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60];
  timeRange: number;
  perPage: number;
  public namespaces: Array<any>;
  public names: Array<any>;
  public ids: Array<number>;
  public subgroups: Array<any>;
  pipelines: any;
  mergerequests: any;
  confirmed = false;
  announced = false;
  subscription: Subscription;
  timeRangeSelectControl = new FormControl('');
  namespaceSelectControl = new FormControl('');
  namespaceControl = new FormControl('');
  subgroupSelectControl = new FormControl('');
  perPageSelectControl = new FormControl('');
  public notification: {
    message: string;
    level?: 'is-danger' | 'is-warning' | 'is-success';
    pipelines?: any;
  } = null;
  msgs: Message[] = [];
  message = 'Snack Bar opened.';
  actionButtonLabel = 'dismiss';
  action = 'open';
  setAutoHide = true;
  autoHide = 2000;
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  config = new MatSnackBarConfig();

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private notificationService: NotificationService,
    private api: GitlabApiService,
    private spinner: NgxSpinnerService,
    private snackBar: MatSnackBar
  ) {
    const pipelines$ = notificationService.pipeLinesNotification$.subscribe(
      pipelines => {
        this.subscriptions.push(pipelines$);
        console.log('settingsComponent pipelines: ', pipelines);
        this.pipelines = pipelines;
        this.announced = true;
        this.confirmed = false;
        this.openSnackBar(pipelines.level + ' : ' + pipelines.message, this.action);
      }
    );
    const mergerequests$ = notificationService.mergeReqNotification$.subscribe(
      mergerequests => {
        this.subscriptions.push(mergerequests$);
        console.log('settingsComponent mergerequests: ', mergerequests);
        this.mergerequests = mergerequests;
        this.announced = true;
        this.confirmed = false;
        this.openSnackBar(mergerequests.level + ' : ' + mergerequests.message, this.action);
      }
    );
    const notifications$ = this.notificationService.activeNotification$.subscribe(
      notification => {
        this.subscriptions.push(notifications$);
        this.notification = notification;
        this.spinner.hide();
        this.openSnackBar(notification.message, this.action);
      }
    );
  }

  @Output() isVisibleChange = new EventEmitter();

  @Input()
  get isVisible() {
    return this._isVisible;
  }

  set isVisible(value: boolean) {
    this._isVisible = value;
    this.isVisibleChange.emit(this._isVisible);
  }

  ngOnInit() {
    this.fetchNamespaces();
    this.createForm();
    this.config.verticalPosition = this.verticalPosition;
    this.config.horizontalPosition = this.horizontalPosition;
    this.config.duration = this.setAutoHide ? this.autoHide : 0;
  }

  private createForm() {
    const savedConfig = this.settingsService.settings;
    this.settingsForm = this.fb.group({
      isGitlabDotCom: [
        !!savedConfig ? savedConfig.isGitlabDotCom : false,
        Validators.required
      ],
      gitlabAddress: !!savedConfig ? savedConfig.gitlabAddress : '',
      accessToken: [
        !!savedConfig ? savedConfig.accessToken : '',
        Validators.required
      ],
      timeRange: !!savedConfig ? savedConfig.timeRange : '',
      perPage: !!savedConfig ? savedConfig.perPage : '',
      namespace: !!savedConfig ? savedConfig.namespace : '',
      subgroup: !!savedConfig ? savedConfig.subgroup : '',
      isCrossProject: [
        !!savedConfig ? savedConfig.isCrossProject : false,
        Validators.required
      ]
    });
  }

  setTimeRange(timeRange) {
    this.settingsForm.value.timeRange = timeRange;
    this.settingsService.settings.timeRange = this.settingsForm.value.timeRange;
  }

  setPerPage(perPage) {
    this.settingsForm.value.perPage = perPage;
    this.settingsService.settings.perPage = this.settingsForm.value.perPage;
  }

  private fetchNamespaces() {
    this.isLoading = true;
    this.spinner.show();
    console.log('');
    console.log('fetching name spaces');
    const names = [];
    const namespaceList = [];
    const namespaces$ = this.api.namespaces.subscribe(
      namespaces => {
        this.subscriptions.push(namespaces$);
        if (namespaces.length > 0) {
          namespaceList.push({
            ...namespaces
          });
        }
        for (const namespace of namespaces) {
          names.push(namespace);
        }
        this.names = names;
      },
      err => {
        this.notificationService.activeNotification.next({ message: err.message });
      }
    );
  }

  private fetchSubgroupsyGroupID(id: any) {
    console.log('fetching subgroups');
    const subgroupsArray: any = [];
    this.api.subgroupsByGroupID(id).subscribe(
      subgroups => {
        for (const s of subgroups as any) {
          console.log('subgroup ', s);
          subgroupsArray.push(s);
        }
        this.subgroups = subgroupsArray;
      },
      err => {
        this.notificationService.activeNotification.next({ message: err.message });
      }
    );
  }

  onSelection(namespaceObject) {
    this.settingsForm.value.namespace = namespaceObject.name;
    this.settingsService.settings = this.settingsForm.value;
    this.fetchSubgroupsyGroupID(namespaceObject.id);
    this.hide();
  }

  onSubmit() {
    this.settingsService.settings = this.settingsForm.value;
    this.hide();
  }

  hide() {
    this.isVisible = false;
  }

  onCancel() {
    this.isVisible = false;
  }

  onDestroy() {
    this.clearSubscriptions();
  }

  private clearSubscriptions() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action ? this.actionButtonLabel : undefined, this.config);
  }
}
