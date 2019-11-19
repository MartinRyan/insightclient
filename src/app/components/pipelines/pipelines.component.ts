import { Component, OnDestroy, OnInit, NgZone } from '@angular/core';
import { compareDesc, differenceInWeeks} from 'date-fns';
import { each, isEmpty, uniqBy } from 'lodash';
import {parseISO} from 'date-fns';

import { GitlabApiService } from './../../services/gitlab-api/gitlab-api.service';
import { NotificationService } from './../../services/notification/notification.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { SvgIconRegistryService } from 'angular-svg-icon';

@Component({
  selector: 'app-pipelines',
  templateUrl: './pipelines.component.html',
  styleUrls: ['./pipelines.component.styl']
})

export class PipelinesComponent implements OnInit, OnDestroy {
  public pipelines: Array<any>;
  public isLoading = false;
  private subscriptions: Array<any> = [];
  public iconbase = '/assets/sprite_icons/';
  public ext = '.svg';

  public STATUSES = Object.freeze({
    success: {status: 'status_success', icon: '/assets/sprite_icons/status_success.svg', colour: '#31ff53'},
    failure: {status: 'status_failure', icon: '/assets/sprite_icons/status_success.svg', colour: '#ff3a2b'}
  });

  constructor(
    private api: GitlabApiService,
    private notificationService: NotificationService,
    private spinner: NgxSpinnerService,
    private zone: NgZone,
    private iconReg: SvgIconRegistryService) { }

  ngOnInit() {
    this.iconReg.loadSvg('assets/sprite_icons/status_success.svg', 'status_success');
    this.fetchdata();
    this.zone.runOutsideAngular(() => {
      setInterval(() => {
        this.clearSubscriptions();
        this.fetchdata();
      }, 30000);
    });
  }

  ngOnDestroy() {
    this.clearSubscriptions();
  }

  private fetchdata() {
    this.isLoading = true;
    this.spinner.show();
    // tslint:disable-next-line:no-console
    console.debug('refreshing pipelines');
    this.pipelines = [];
    const details = 'pipeline_details';
    const projects$ = this.api.projects.subscribe(projects => {
      this.subscriptions.push(projects$);
      projects.forEach(project => {
        const pipelines$ = this.api
          .fetchPipelines(project.id)
          .subscribe(pipelines => {
            this.subscriptions.push(pipelines$);
            // no empty pipelines
            if (pipelines.length > 0) {
              // unique by id
              const tidyPipelines = uniqBy(pipelines, item => item.id);
              tidyPipelines.forEach(pipeline => {
                const pipeline$ = this.api
                  .fetchPipeline(project.id, pipeline.id)
                  .subscribe(pipelineDetails => {
                    this.notificationService.activeNotification.next(null);
                    this.isLoading = false;
                    this.spinner.hide();
                    this.subscriptions.push(pipeline$);
                     // tslint:disable-next-line:no-console
                    // console.debug('PIPELINE COMPONENT _ PIPELINE DETAILS -> ' + pipelineDetails[details]);
                    // only add the pipelines that have run in the last week - if pipeline volumes are significant
                    // if (differenceInWeeks(new Date(pipelineDetails[details]), new Date()) === 0) {
                    this.pipelines.push({
                        ...pipelineDetails,
                        ...{ project },
                      });
                    this.pipelines.sort((o1, o2) => compareDesc(parseISO(o1.updated_at), parseISO(o2.updated_at)));
                    // }
                  });
              });
            } else {
              // tslint:disable-next-line:no-console
              console.debug('refreshing pipelines length zero ' + pipelines.length);
            }
          });
      });
    }, err => {
      this.notificationService.activeNotification.next({ message: err.message });
    });
  }

  public setStatusColour(pipeline: any) {
    // tslint:disable-next-line: no-console
    // console.debug('pipeline.detailed_status.text}: ' + pipeline.detailed_status.text);
    // const status = pipeline.detailed_status.text;
    const status = pipeline.status;
    // tslint:disable-next-line: no-console
    console.debug('this.STATUSES[status].colour: ' + this.STATUSES[status].colour);
    return this.STATUSES[status].colour;
  }

  private clearSubscriptions() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

}
