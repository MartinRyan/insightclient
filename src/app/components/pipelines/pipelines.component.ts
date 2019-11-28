import { Component, OnDestroy, OnInit, NgZone } from '@angular/core';
import { compareDesc, differenceInWeeks } from 'date-fns';
import { each, isEmpty, uniqBy } from 'lodash';
import { parseISO } from 'date-fns';

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
    success: { status: 'status_success', icon: '/assets/sprite_icons/status_success.svg', colour: '#90fe88' },
    failed: { status: 'status_failed', icon: '/assets/sprite_icons/status_failed.svg', colour: '#ff6740' },
    pending: { status: 'status_pending', icon: '/assets/sprite_icons/status_success.svg', colour: '#ff3a2b' },
    running: { status: 'status_running', icon: '/assets/sprite_icons/status_running.svg', colour: '#4ab7ff' },
    passed: { status: 'status_success', icon: '/assets/sprite_icons/status_success.svg', colour: '#90fe88' },
    skipped: { status: 'status_skipped', icon: '/assets/sprite_icons/status_success.svg', colour: '#b6fcfe' },
    canceled: { status: 'status_canceled', icon: '/assets/sprite_icons/status_success.svg', colour: '#87C4FF' },
    uknown: { status: 'status_uknown', icon: '/assets/sprite_icons/status_success.svg', colour: '#ccc' }
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
    this.fetchNamespaces();
    this.zone.runOutsideAngular(() => {
      setInterval(() => {
        this.clearSubscriptions();
        // this.fetchdata();
        // this.fetchNamespaces();
      }, 60000);
    });
  }

  ngOnDestroy() {
    this.clearSubscriptions();
  }

  private fetchdata() {
    this.isLoading = true;
    this.spinner.show();
    console.log('refreshing pipelines');
    this.pipelines = [];
    const details = 'pipeline_details';
    const started = 'started_at';
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
                    // only add the pipelines that have run in the last week - if pipeline volumes are significant
                    if (differenceInWeeks(new Date(pipelineDetails[started]), new Date()) === 0) {
                    this.pipelines.push({
                      ...pipelineDetails,
                      ...{ project },
                    });
                    this.pipelines.sort((o1, o2) => compareDesc(parseISO(o1.updated_at), parseISO(o2.updated_at)));
                    }
                  });
              });
            } else {
              console.log('refreshing pipelines length zero ' + pipelines.length);
            }
          });
      });
    }, err => {
      this.notificationService.activeNotification.next({ message: err.message });
    });
  }

  private fetchNamespaces() {
    this.isLoading = true;
    this.spinner.show();
    console.log('');
    console.log('refreshing name spaces');
    const names = [];
    const ids = [];
    // names.push('ACCESS'); // for testing, as only an admin sees all namespaces
    // ids.push(11); // for testing, as only an admin sees all namespaces
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
      // this.fetchProjects(names);
      this.fetchProjectsByGroupID(ids);
      // this.fetchProjectsByGroupName(names);
    }, err => {
      this.notificationService.activeNotification.next({ message: err.message });
    });
  }

  private fetchProjects(names: Array<string>) {
    const projectsArray: any = [];
    this.isLoading = true;
    this.spinner.show();
    for (const name of names) {
      console.log('fetching projects');
      const projectObjects: any = [];
      this.api.projectsByNamespace(name)
        .subscribe(projects => {
          for (const p of (projects as any)) {
            // projectsArray.push(p);
            projectsArray.push({
              name: p.name,
              id: p.id
            });
          }
          this.fetchPipelines(projectsArray);
        }, err => {
          this.notificationService.activeNotification.next({ message: err.message });
        });
    }
  }

  private fetchProjectsByGroupID(ids: Array<string>) {
    console.log('fetching projects');
    const projectsArray: any = [];
    // this.isLoading = true;
    // this.spinner.show();
    for (const id of ids) {
      console.log('id -> ' + id);
      this.api.projectsByGroupID(id)
        .subscribe(projects => {
          for (const p of (projects as any)) {
            // projectsArray.push(p);
            projectsArray.push({
              name: p.name,
              id: p.id
            });
          }
          this.fetchPipelines(projectsArray);
        }, err => {
          this.notificationService.activeNotification.next({ message: err.message });
        });
    }
  }

  private fetchProjectsByGroupName(names: Array<string>) {
    const projectsArray: any = [];
    // this.isLoading = true;
    // this.spinner.show();
    for (const name of names) {
      console.log('fetching projects');
      console.log('name -> ' + name);
      const projectObjects: any = [];
      this.api.projectsByGroupName(name)
        .subscribe(projects => {
          for (const p of (projects as any)) {
            // projectsArray.push(p);
            projectsArray.push({
              name: p.name,
              id: p.id
            });
          }
          this.fetchPipelines(projectsArray);
        }, err => {
          this.notificationService.activeNotification.next({ message: err.message });
        });
    }
  }

  private fetchPipelines(projects: any) {
    // this.isLoading = true;
    // this.spinner.show();
    console.log('');
    console.log('refreshing pipelines');
    // console.log('projects: ' + projects);
    this.pipelines = [];
    const details = 'pipeline_details';
    const started = 'started_at';
    projects.forEach(project => {
      // console.log('project.id: ' + project.id);
      // console.log('project.id: ' + project.name);
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
                  // only add the pipelines that have run in the last week - if pipeline volumes are significant
                  if (differenceInWeeks(new Date(pipelineDetails[started]), new Date()) === 0) {
                  this.pipelines.push({
                    ...pipelineDetails,
                    ...{ project },
                  });
                  this.pipelines.sort((o1, o2) => compareDesc(parseISO(o1.updated_at), parseISO(o2.updated_at)));
                  }
                });
            });
          }
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
