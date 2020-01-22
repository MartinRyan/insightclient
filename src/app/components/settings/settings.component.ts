import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
  public namespaces: Array<any>;
  public names: Array<any>;
  public ids: Array<number>;
  public subgroups: Array<any>;
  pipelines: any;
  mergerequests: any;
  confirmed = false;
  announced = false;
  subscription: Subscription;
  namespaceSelectControl = new FormControl('', [Validators.required]);
  namespaceControl = new FormControl('', [Validators.required]);
  subgroupSelectControl = new FormControl('');

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private notificationService: NotificationService,
    private api: GitlabApiService,
    private spinner: NgxSpinnerService
  ) {
    const pipelines$ = notificationService.pipeLinesNotification$.subscribe(
      pipelines => {
        this.subscriptions.push(pipelines$);
        console.log('settingsComponent pipelines: ', pipelines);
        this.pipelines = pipelines;
        this.announced = true;
        this.confirmed = false;
      }
    );
    const mergerequests$ = notificationService.mergeReqNotification$.subscribe(
      mergerequests => {
        this.subscriptions.push(mergerequests$);
        console.log('settingsComponent mergerequests: ', mergerequests);
        this.mergerequests = mergerequests;
        this.announced = true;
        this.confirmed = false;
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
      namespace: !!savedConfig ? savedConfig.namespace : '',
      subgroup: !!savedConfig ? savedConfig.subgroup : '',
      isCrossProject: [
        !!savedConfig ? savedConfig.isCrossProject : false,
        Validators.required
      ]
    });
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
          console.log('namespace.name ' + namespace.name);
          console.log('namespace.id ' + namespace.id);
        }
        this.names = names;
      },
      err => {
        this.notificationService.activeNotification.next({
          message: err.message
        });
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
        this.notificationService.activeNotification.next({
          message: err.message
        });
      }
    );
  }

  onSelection(namespaceObject) {
    console.log('onSelection namespaceObject id ', namespaceObject.id);
    console.log('onSelection namespaceObject name ', namespaceObject.name);
    this.settingsForm.value.namespace = namespaceObject.name;
    this.settingsService.settings = this.settingsForm.value;
    this.fetchSubgroupsyGroupID(namespaceObject.id);
    this.hide();
    this.notificationService.activeNotification.next({
      message: 'Please wait a few seconds...',
      level: 'is-warning'
    });
  }

  onSubmit() {
    this.settingsService.settings = this.settingsForm.value;
    this.hide();
    this.notificationService.activeNotification.next({
      message: 'Please wait a few seconds...',
      level: 'is-warning'
    });
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
}
