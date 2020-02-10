import { Component, OnInit } from '@angular/core';
import { isEmpty, uniqBy } from 'lodash';
import { NgxSpinnerService } from 'ngx-spinner';

import { GitlabApiService } from './../../services/gitlab-api/gitlab-api.service';
import { NotificationService } from './../../services/notification/notification.service';
import { SettingsService } from './../../services/settings/settings.service';

@Component({
  selector: 'app-runners',
  templateUrl: './runners.component.html',
  styleUrls: ['./runners.component.styl']
})
export class RunnersComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
