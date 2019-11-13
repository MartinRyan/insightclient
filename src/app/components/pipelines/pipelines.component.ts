import { Component, OnDestroy, OnInit, NgZone } from '@angular/core';
import { compareDesc, differenceInWeeks} from 'date-fns';
import { uniqBy } from 'lodash';

import { GitlabApiService } from './../../services/gitlab-api/gitlab-api.service';
import { NotificationService } from './../../services/notification/notification.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-pipelines',
  templateUrl: './pipelines.component.html',
  styleUrls: ['./pipelines.component.styl']
})

export class PipelinesComponent implements OnInit, OnDestroy {
  public pipelines: Array<any>;
  public isLoading = false;
  private subscriptions: Array<any> = [];

  constructor(
    private api: GitlabApiService,
    private notificationService: NotificationService,
    private spinner: NgxSpinnerService,
    private zone: NgZone) { }

  ngOnInit() {
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
              // I only want one pipeline for each ref (branch...)
              const tidyPipelines = uniqBy(pipelines, item => item.ref);
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
                    // only add the pipelines that have run in the last week
                    // if (differenceInWeeks(new Date(pipelineDetails[details]), new Date()) === 0) {
                    this.pipelines.push({
                        ...pipelineDetails,
                        ...{ project },
                      });
                    this.pipelines.sort((o1, o2) => compareDesc(o1.updated_at, o2.updated_at));
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

  private clearSubscriptions() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

}
