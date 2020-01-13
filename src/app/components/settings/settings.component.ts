import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, OnChanges, Output,
  SimpleChanges, SimpleChange } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { NotificationService } from './../../services/notification/notification.service';
import { SettingsService } from './../../services/settings/settings.service';
import { GitlabApiService } from './../../services/gitlab-api/gitlab-api.service';
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
  public names: Array<string>;
  namespaceControl = new FormControl('', [Validators.required]);
  selectFormControl = new FormControl('', Validators.required);

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private notificationService: NotificationService,
    private api: GitlabApiService,
    private spinner: NgxSpinnerService) { }

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
        Validators.required,
      ],
      gitlabAddress: !!savedConfig ? savedConfig.gitlabAddress : '',
      accessToken: [
        !!savedConfig ? savedConfig.accessToken : '',
        Validators.required,
      ],
      namespace: !!savedConfig ? savedConfig.namespace : '',
      isCrossProject: [
        !!savedConfig ? savedConfig.isCrossProject : false,
        Validators.required,
      ]
    });
  }

  private fetchNamespaces() {
    this.isLoading = true;
    this.spinner.show();
    console.log('');
    console.log('fetching name spaces');
    const names = [];
    const ids = [];
    const namespaceList = [];
    const namespaces$ = this.api.namespaces.subscribe(namespaces => {
      this.subscriptions.push(namespaces$);
      if (namespaces.length > 0) {
        namespaceList.push({
          ...namespaces
        });
      }
      for (const namespace of namespaces) {
        names.push(namespace.name);
        console.log('namespace.name ' + namespace.name);
      }
      this.names = names;
    }, err => {
      this.notificationService.activeNotification.next({ message: err.message });
    });
  }

  onSelection(namespace) {
    this.settingsForm.value.namespace = namespace;
    this.settingsService.settings = this.settingsForm.value;
    this.hide();
    this.notificationService.activeNotification.next({
        message: 'Please wait a few seconds...',
        level: 'is-warning',
      });
    }

  onSubmit() {
    this.settingsService.settings = this.settingsForm.value;
    this.hide();
    this.notificationService.activeNotification.next({
      message: 'Please wait a few seconds...',
      level: 'is-warning',
    });
  }

  hide() {
    this.isVisible = false;
  }

  onCancel() {
    this.isVisible = false;
  }
}
