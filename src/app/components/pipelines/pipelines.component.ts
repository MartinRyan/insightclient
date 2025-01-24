import { AfterViewInit, Component, EventEmitter, NgZone, OnDestroy, OnInit, Output } from '@angular/core';
import { SvgIconRegistryService } from 'angular-svg-icon';
import { compareDesc, differenceInDays, parseISO } from 'date-fns';
import { isEmpty, uniqBy } from 'lodash';
import { NgxSpinnerService } from 'ngx-spinner';

import { GitlabApiService } from './../../services/gitlab-api/gitlab-api.service';
import { NotificationService } from './../../services/notification/notification.service';
import { SettingsService } from './../../services/settings/settings.service';
import { Memoize } from 'lodash-decorators/memoize';
import { Subscription, timer } from 'rxjs';


@Component({
  selector: 'app-pipelines',
  templateUrl: './pipelines.component.html',
  styleUrls: ['./pipelines.component.styl']
})
export class PipelinesComponent implements OnInit, OnDestroy, AfterViewInit {
  public pipelines: Array<any>;
  public namespaces: Array<any>;
  public namespaceNames: Array<string>;
  public isLoading = false;
  private subscriptions: Array<any> = [];
  public iconbase = '/assets/sprite_icons/';
  public ext = '.svg';
  public timeRangeDays: number;
  public perPage: number = 100;
  public timeRangeWeeks = 100;
  public updateInterval = 62000;
  sservice: SettingsService;
  subscription: Subscription;
  polling: boolean;
  pollingStatus;
  ndays: number;
  timeRange: number;

  public STATUSES = Object.freeze({
    success: {
      status: 'status_success',
      icon: '/assets/sprite_icons/status_success.svg',
      colour: '#90fe88'
    },
    failed: {
      status: 'status_failed',
      icon: '/assets/sprite_icons/status_failed.svg',
      colour: '#ff6740'
    },
    pending: {
      status: 'status_pending',
      icon: '/assets/sprite_icons/status_success.svg',
      colour: '#ff3a2b'
    },
    running: {
      status: 'status_running',
      icon: '/assets/sprite_icons/status_running.svg',
      colour: '#4ab7ff'
    },
    passed: {
      status: 'status_success',
      icon: '/assets/sprite_icons/status_success.svg',
      colour: '#90fe88'
    },
    skipped: {
      status: 'status_skipped',
      icon: '/assets/sprite_icons/status_success.svg',
      colour: '#b6fcfe'
    },
    canceled: {
      status: 'status_canceled',
      icon: '/assets/sprite_icons/status_success.svg',
      colour: '#87C4FF'
    },
    uknown: {
      status: 'status_uknown',
      icon: '/assets/sprite_icons/status_success.svg',
      colour: '#ccc'
    }
  });

  @Output() pipelineEvent: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private api: GitlabApiService,
    private settingsService: SettingsService,
    private notificationService: NotificationService,
    private spinner: NgxSpinnerService,
    private zone: NgZone,
    private iconReg: SvgIconRegistryService
  ) { 
    this.sservice = settingsService;
  }

  ngOnInit() {
    if (!isEmpty(this.sservice.settings) && (!isEmpty(this.sservice.settings.perPage))) {
      this.perPage = Number(this.sservice.settings.perPage)
    } else {
      this.perPage = 100
    }
    this.startPolling();
  }

  ngAfterViewInit() { }

  ngOnDestroy() {
    if (!isEmpty(this.subscription)) {
      this.subscription.unsubscribe()
    }
  }

  // entry for single namespace data
  @Memoize
  private fetchdata(ndays) {
    this.isLoading = true;
    this.spinner.show();
    console.log('refreshing pipelines');
    this.pipelines = [];
    const details = 'pipeline_details';
    const started = 'started_at';
    const projects$ = this.api.projects.subscribe(
      projects => {
        this.subscriptions.push(projects$);
        projects.forEach(project => {
          const pipelines$ = this.api
            .fetchPipelines(project.id)
            .subscribe(pipelines => {
              this.subscriptions.push(pipelines$);
              // no empty pipelines
              if (pipelines && pipelines.length > 0) {
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
                      // only add the pipelines that have run in the timeRange - if pipeline volumes are significant
                      if (differenceInDays(new Date(pipelineDetails[started]), new Date()) >= (-Math.abs(ndays))) {
                      this.pipelines.push({
                        ...pipelineDetails,
                        ...{ project }
                      });
                      }
                      this.pipelines.sort((o1, o2) =>
                        compareDesc(parseISO(o1.updated_at), parseISO(o2.updated_at))
                      );
                    });
                });
                // this.notificationService.announcePipelines({
                //   message: 'pipelines loaded',
                //   level: 'is-success',
                //   pipelines: pipelines.length
                // });
              }
              // else if (
              //       this.pipelines !== [] &&
              //       (this.pipelines.length === undefined ||
              //         this.pipelines.length < 1 ||
              //         this.pipelines.length === null)
              //     ) {
              //       this.isLoading = false;
              //       this.spinner.hide();
              //       this.notificationService.announcePipelines({
              //         message: 'no pipelines loaded',
              //         level: 'is-danger',
              //         pipelines: this.pipelines.length
              //       });
              //     }
            });
        });
      },
      err => {
        this.isLoading = false;
        this.spinner.hide();
        this.notificationService.activeNotification.next({
          message: err.message
        });
      }
    );
    // if (
    //   this.pipelines !== [] &&
    //   (this.pipelines.length === undefined ||
    //     this.pipelines.length < 1 ||
    //     this.pipelines.length === null)
    // ) {
    //   this.isLoading = false;
    //   this.spinner.hide();
    //   this.notificationService.announcePipelines({
    //     message: 'no pipelines loaded',
    //     level: 'is-danger',
    //     pipelines: this.pipelines.length
    //   });
    // }
  }

  // entry for multi namespace data
  @Memoize
  private fetchNamespaces() {
    this.isLoading = true;
    this.spinner.show();
    console.log('');
    console.log('refreshing name spaces');
    const names = [];
    const ids = [];
    const namespaceObjects = [];
    const namespaces$ = this.api.namespaces.subscribe(namespaces => {
      this.subscriptions.push(namespaces$);
      if (namespaces.length > 0) {
        namespaceObjects.push({
          ...namespaces
        });
      }
      console.log('namespaces ' + namespaces);
      for (const namespace of namespaces) {
        names.push(namespace.name);
        console.log('namespace.id ' + namespace.id);
        ids.push(namespace.id);
      }
      this.fetchProjectsByGroupID(ids);
    }, err => {
      this.notificationService.activeNotification.next({ message: err.message });
    });
  }

  @Memoize
  private fetchProjectsByGroupID(ids: Array<string>) {
    console.log('fetching projects');
    const projectsArray: any = [];
    for (const id of ids) {
      console.log('id -> ' + id);
      this.api.projectsByGroupID(id).subscribe(
        projects => {
          for (const p of projects as any) {
            projectsArray.push({
              name: p.name,
              id: p.id
            });
          }
          const uniqueProjects: Array<any> = uniqBy(
            projectsArray,
            item => item.id
          );
          this.fetchPipelines(uniqueProjects);
        },
        err => {
          this.isLoading = false;
          this.spinner.hide();
          this.notificationService.activeNotification.next({
            message: err.message
          });
        }
      );
    }
  }

  @Memoize
  private fetchPipelines(projects: any) {
    console.log('');
    console.log('refreshing pipelines');
    this.pipelines = [];
    const details = 'pipeline_details';
    const started = 'started_at';
    projects.forEach(project => {
      const pipelines$ = this.api.fetchPipelines(project.id).subscribe(
        pipelines => {
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
                  if (differenceInDays(new Date(pipelineDetails[started]), new Date()) >= (this.timeRange * -1)) {
                  this.pipelines.push({
                      ...pipelineDetails,
                      ...{ project }
                    });
                    // this.notificationService.announcePipelines({
                    //   message: 'pipelines loaded', level: 'is-success', pipelines: pipelines.length
                    // });
                  }
                });
            });
            this.pipelines.sort((o1, o2) =>
              compareDesc(parseISO(o1.updated_at), parseISO(o2.updated_at))
            );
          }
          // else {
          //   this.notificationService.announcePipelines({
          //     message: 'pipelines loaded',
          //     level: 'is-success',
          //     pipelines: pipelines.length
          //   });
          // this.spinner.hide();
          // }
        },
        err => {
          this.isLoading = false;
          this.spinner.hide();
          this.notificationService.activeNotification.next({
            message: err.message
          });
        }
      );
    });
  }

  startPolling() {
    this.polling = true;
    this.pollingStatus = 'started';
    if (!isEmpty(this.sservice.settings) && (!isEmpty(this.sservice.settings.timeRange))) {
      this.ndays = Number(this.sservice.settings.timeRange)
    } else {
      this.ndays = 1;
    }
    this.subscription = timer(0, this.updateInterval).subscribe(val => this.fetchdata(this.ndays));
  }

  stopPolling() {
    this.polling = false;
    this.pollingStatus = 'stopped';
    this.subscription.unsubscribe();
  }

  toggleData() {
    this.polling == true ? this.stopPolling() : this.startPolling();
  }

  getPollingIcon() {
    let icon = '';
    if (this.polling === true) {
      icon = 'toggle_on';
    } else if (this.polling === false) {
      icon = 'toggle_off';
    }
    return icon;
  }

  public setStatusColour(pipeline: any) {
    const status = pipeline.detailed_status.text;
    const colour = this.STATUSES[status].colour;
    return colour;
  }
}
