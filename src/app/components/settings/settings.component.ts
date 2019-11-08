import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, OnChanges, Output,
  SimpleChanges, SimpleChange } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { NotificationService } from './../../services/notification/notification.service';
import { SettingsService } from './../../services/settings/settings.service';

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

  constructor(private fb: FormBuilder, private settingsService: SettingsService, private notificationService: NotificationService) { }

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
    this.createForm();
  }

  private createForm() {
    const savedConfig = this.settingsService.settings;
    this.settingsForm = this.fb.group({
      isGitlabDotCom: [
        !!savedConfig ? savedConfig.isGitlabDotCom : true,
        Validators.required,
      ],
      gitlabAddress: !!savedConfig ? savedConfig.gitlabAddress : '',
      accessToken: [
        !!savedConfig ? savedConfig.accessToken : '',
        Validators.required,
      ],
      namespace: !!savedConfig ? savedConfig.namespace : '',
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
    this._isVisible = false;
  }
}
