import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import {
  compareDesc,
  differenceInDays,
  differenceInWeeks,
  parseISO
} from 'date-fns';
import { uniqBy } from 'lodash';
import { NgxSpinnerService } from 'ngx-spinner';

import { GitlabApiService } from './../../services/gitlab-api/gitlab-api.service';
import { NotificationService } from './../../services/notification/notification.service';
import { SettingsService } from './../../services/settings/settings.service';

@Component({
  selector: 'app-merge-requests',
  templateUrl: './merge-requests.component.html',
  styleUrls: ['./merge-requests.component.styl']
})
export class MergeRequestsComponent implements OnInit, OnDestroy {
  public mergeRequests: Array<any>;
  public isLoading = false;
  private subscriptions: Array<any> = [];

  constructor(
    private api: GitlabApiService,
    private settingsService: SettingsService,
    private notificationService: NotificationService,
    private spinner: NgxSpinnerService,
    private zone: NgZone
  ) {}

  ngOnInit() {
    this.settingsService.settings.isCrossProject === 'true'
      ? this.fetchNamespaces()
      : this.fetchdata();
    this.zone.runOutsideAngular(() => {
      setInterval(() => {
        this.clearSubscriptions();
        this.settingsService.settings.isCrossProject === 'true'
          ? this.fetchNamespaces()
          : this.fetchdata();
      }, 60000);
    });
  }

  ngOnDestroy() {
    this.clearSubscriptions();
  }

  // entry for single namespace data
  private fetchdata() {
    this.isLoading = true;
    this.spinner.show();
    const key = 'namespace';
    // tslint:disable-next-line:no-console
    console.debug('refreshing MRs');
    this.mergeRequests = [];
    const mergeReqs$ = this.api.mergeRequests.subscribe(
      mergeRequests => {
        this.subscriptions.push(mergeReqs$);
        if (mergeRequests.length > 0) {
          mergeRequests.forEach(mergeRequest => {
            const project$ = this.api
              .fetchProject(mergeRequest.project_id)
              .subscribe(project => {
                this.subscriptions.push(project$);
                if (
                  project[key].name === this.settingsService.settings.namespace
                ) {
                  const lastPipeline$ = this.api
                    .fetchLastPipelineByRef(
                      project.id,
                      mergeRequest.source_branch
                    )
                    .subscribe(lastPipeline => {
                      this.notificationService.activeNotification.next(null);
                      this.isLoading = false;
                      this.spinner.hide();
                      this.subscriptions.push(lastPipeline$);
                      this.mergeRequests.push({
                        ...mergeRequest,
                        ...{ project },
                        ...{
                          ci_status:
                            lastPipeline.length > 0
                              ? lastPipeline[0].status
                              : 'unknown'
                        }
                      });
                      this.notificationService.announceMergeRequests({
                        message: 'merge requests loaded',
                        level: 'is-success',
                        mergerequests: this.mergeRequests.length
                      });
                    });
                }
              });
          });
        } else {
          this.spinner.hide();
          this.isLoading = false;
          this.notificationService.announceMergeRequests({
            message: 'no merge requests loaded',
            level: 'is-danger',
            mergerequests: 0
          });
        }
      },
      err => {
        this.notificationService.activeNotification.next({ message: err.message });
      }
    );
  }

  // entry for multi namespace data
  private fetchNamespaces() {
    this.isLoading = true;
    this.spinner.show();
    console.log('');
    console.log('refreshing name spaces');
    const names = [];
    const ids = [];
    const namespaceObjects = [];
    const namespaces$ = this.api.namespaces.subscribe(
      namespaces => {
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
      },
      err => {
        this.notificationService.activeNotification.next({ message: err.message });
      }
    );
  }

  private fetchProjectsByGroupID(ids: Array<string>) {
    console.log('fetching projects');
    const projectsArray: any = [];
    for (const id of ids) {
      console.log('merge requests id -> ' + id);
      this.api.projectsByGroupID(id).subscribe(
        projects => {
          for (const p of projects as any) {
            // projectsArray.push(p);
            projectsArray.push({
              name: p.name,
              id: p.id
            });
          }
          this.fetchMergeRequests(projectsArray);
        },
        err => {
          this.notificationService.activeNotification.next({ message: err.message });
        }
      );
    }
  }

  private fetchMergeRequests(projects: Array<any>) {
    console.log('fetching merge requests');
    this.mergeRequests = [];
    const created = 'created_at';
    const mergeReqs$ = this.api.mergeRequests.subscribe(
      mergeRequests => {
        this.subscriptions.push(mergeReqs$);
        if (mergeRequests.length > 0) {
          mergeRequests.forEach(mergeRequest => {
            const project$ = this.api
              .projectByID(mergeRequest.project_id)
              .subscribe(project => {
                this.subscriptions.push(project$);
                console.log('merge requests project id -> ' + project.id);
                console.log(
                  'merge requests mergeRequest.source_branch -> ' +
                    mergeRequest.source_branch
                );
                const lastPipeline$ = this.api
                  .fetchLastPipelineByRef(
                    project.id,
                    mergeRequest.source_branch
                  )
                  .subscribe(lastPipeline => {
                    this.notificationService.activeNotification.next(null);
                    this.isLoading = false;
                    this.spinner.hide();
                    this.subscriptions.push(lastPipeline$);
                    // only add the merge requests that have run in the last week
                    // if (differenceInDays(new Date(mergeRequest[created]), new Date()) >= -7) {
                    this.mergeRequests.push({
                      ...mergeRequest,
                      ...{ project },
                      ...{
                        ci_status:
                          lastPipeline.length > 0
                            ? lastPipeline[0].status
                            : 'unknown'
                      }
                    });
                    const tidyMergeRequests = uniqBy(
                      this.mergeRequests,
                      item => item.id
                    );
                    tidyMergeRequests.sort((o1, o2) =>
                      compareDesc(
                        parseISO(o1.updated_at),
                        parseISO(o2.updated_at)
                      )
                    );
                    this.mergeRequests = tidyMergeRequests;
                    // this.notificationService.announceMergeRequests({
                    //   message: 'merge requests loaded',
                    //   level: 'is-success',
                    //   mergerequests: this.mergeRequests.length
                    // });
                    // }
                  });
              });
          });
        } else {
          console.log(
            'fetching merge requests length zero ' + this.mergeRequests.length
          );
          this.spinner.hide();
          this.isLoading = false;
          // this.notificationService.announcePipelines({
          //   message: 'no merge requests loaded',
          //   level: 'is-danger',
          //   mergerequests: 0
          // });
        }
      },
      err => {
        this.notificationService.activeNotification.next({ message: err.message });
      }
    );
  }

  private clearSubscriptions() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }
}
