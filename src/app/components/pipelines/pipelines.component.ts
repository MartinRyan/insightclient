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
  public namespaces: Array<any>;
  public namespaceNames: Array<string>;
  private projects: any[];
  public isLoading = false;
  private subscriptions: Array<any> = [];
  public iconbase = '/assets/sprite_icons/';
  public ext = '.svg';

  public STATUSES = Object.freeze({
    success: {status: 'status_success', icon: '/assets/sprite_icons/status_success.svg', colour: '#90fe88'},
    failed: {status: 'status_failed', icon: '/assets/sprite_icons/status_failed.svg', colour: '#ff6740'},
    pending: {status: 'status_pending', icon: '/assets/sprite_icons/status_success.svg', colour: '#ff3a2b'},
    running: {status: 'status_running', icon: '/assets/sprite_icons/status_running.svg', colour: '#4ab7ff'},
    passed: {status: 'status_success', icon: '/assets/sprite_icons/status_success.svg', colour: '#90fe88'},
    skipped: {status: 'status_skipped', icon: '/assets/sprite_icons/status_success.svg', colour: '#b6fcfe'},
    canceled: {status: 'status_canceled', icon: '/assets/sprite_icons/status_success.svg', colour: '#87C4FF'},
    uknown: {status: 'status_uknown', icon: '/assets/sprite_icons/status_success.svg', colour: '#ccc'}
  });

  constructor(
    private api: GitlabApiService,
    private notificationService: NotificationService,
    private spinner: NgxSpinnerService,
    private zone: NgZone,
    private iconReg: SvgIconRegistryService) { }

  ngOnInit() {
    this.iconReg.loadSvg('assets/sprite_icons/status_success.svg', 'status_success');
    // this.fetchdata();
    this.fetchAllNamespaces();
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

  private fetchAllNamespaces() {
    this.isLoading = true;
    this.spinner.show();
    // tslint:disable-next-line:no-console
    console.debug('refreshing name spaces');
    this.namespaces = [];
    const namespaces$ = this.api.namespaces.subscribe(namespaces => {
      this.subscriptions.push(namespaces$);
      if (namespaces.length > 0) {
        this.namespaces.push({
          ...namespaces
        });
      }
      // tslint:disable-next-line:no-console
      console.debug('namespaces length ' + namespaces.length);
      // tslint:disable-next-line:no-console
      // console.debug('namespaces ' + namespaces);
      each(namespaces, (value, key) => {
      // tslint:disable-next-line:no-console
      // console.debug('namespace key  ' + key);
      // // tslint:disable-next-line:no-console
      // console.debug('namespace value  ' + value);
      // // tslint:disable-next-line:no-console
      // console.debug('namespace value.id ' + value.id);
      // tslint:disable-next-line:no-console
      console.debug('namespace value.name ' + value.name);
      this.namespaceNames.push(value.name);
      // this.fetchdataAll(this.namespaceNames);
      // each(value, (newvalue, newkey) => {
      // tslint:disable-next-line:no-console
      // console.debug('namespace newkey  ' + newkey);
      // tslint:disable-next-line:no-console
      // console.debug('namespace newvalue  ' + newvalue);
      // });
      });
    });
  }

  // use namespaces to fetch projects for each
  // push to pipelines

  private fetchProjects(namespace) {
    each(namespace, (name, key) => {
    // tslint:disable-next-line:no-console
    console.debug('namespace key  ' + key);
    // tslint:disable-next-line:no-console
    console.debug('namespace value  ' + name);
    // this.projects = this.api.projectByNamespace(name);
  });
  }

  private fetchdataAll(namespaceNames) {
    this.isLoading = true;
    this.spinner.show();
    // tslint:disable-next-line:no-console
    console.debug('refreshing pipelines');
    each(namespaceNames, (namespace, key) => {
    this.pipelines = [];
    const details = 'pipeline_details';
    const projects$ = this.api.projects.subscribe(projects => {
        this.subscriptions.push(projects$);
        projects.forEach(project => {
          const pipelines$ = this.api
            .fetchPipelines(project.id)
            // .fetchPipelinesAll()
            .subscribe(pipelines => {
              this.subscriptions.push(pipelines$);
              // no empty pipelines
              if (pipelines.length > 0) {
                // unique by id
                const tidyPipelines = uniqBy(pipelines, item => item.id);
                tidyPipelines.forEach(pipeline => {
                  const pipeline$ = this.api
                    .fetchPipeline(project.id, pipeline.id)
                    // .fetchPipelineB(pipeline.id)
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
  });
  }

  public setStatusColour(pipeline: any) {
    const status = pipeline.detailed_status.text;
    const colour = this.STATUSES[status].colour;
    return colour;
  }

  private clearSubscriptions() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

}
