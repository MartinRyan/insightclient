import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { NotificationService } from './../../services/notification/notification.service';
import { SettingsService } from './../../services/settings/settings.service';
import { GitlabApiService } from './../../services/gitlab-api/gitlab-api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { compareDesc, differenceInDays, differenceInWeeks, parseISO } from 'date-fns';
import { uniqBy } from 'lodash';

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
    private zone: NgZone) { }

  ngOnInit() {
    // this.fetchdata();
    // this.fetchdataAll();
    this.fetchNamespaces();
    this.zone.runOutsideAngular(() => {
      setInterval(() => {
        this.clearSubscriptions();
        // this.fetchdata();
        // this.fetchdataAll();
        this.fetchNamespaces();
      }, 60000);
    });
  }

  ngOnDestroy() {
    this.clearSubscriptions();
  }

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
        mergeRequests.forEach(mergeRequest => {
          const project$ = this.api
            .fetchProject(mergeRequest.project_id)
            .subscribe(project => {
              this.subscriptions.push(project$);
              if (
                project[key].name ===
                this.settingsService.settings.namespace
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
                            : 'unknown',
                      },
                    });
                  });
              }
            });
        });
      },
      err => {
        this.notificationService.activeNotification.next({ message: err.message });
      }
    );
  }
  private fetchdataAll() {
    this.isLoading = true;
    this.spinner.show();
    const key = 'namespace';
    const started = 'started_at';
    // tslint:disable-next-line:no-console
    console.debug('refreshing MRs');
    this.mergeRequests = [];
    const mergeReqs$ = this.api.mergeRequests.subscribe(
      mergeRequests => {
        this.subscriptions.push(mergeReqs$);
        mergeRequests.forEach(mergeRequest => {
          const project$ = this.api
            .fetchProject(mergeRequest.project_id)
            .subscribe(project => {
              this.subscriptions.push(project$);
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
                  if (differenceInWeeks(new Date(lastPipeline[started]), new Date()) === 0) {
                  this.mergeRequests.push({
                    ...mergeRequest,
                    ...{ project },
                    ...{
                      ci_status:
                        lastPipeline.length > 0
                          ? lastPipeline[0].status
                          : 'unknown',
                    },
                  });
                }
                });
            });
        });
      },
      err => {
        this.notificationService.activeNotification.next({ message: err.message });
      }
    );
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

  private fetchProjectsByGroupID(ids: Array<string>) {
    console.log('fetching projects');
    const projectsArray: any = [];
    for (const id of ids) {
      console.log('merge requests id -> ' + id);
      this.api.projectsByGroupID(id)
        .subscribe(projects => {
          for (const p of (projects as any)) {
            // projectsArray.push(p);
            projectsArray.push({
              name: p.name,
              id: p.id
            });
          }
          // this.fetchPipelines(projectsArray);
          this.fetchMergeRequests(projectsArray);
        }, err => {
          this.notificationService.activeNotification.next({ message: err.message });
        });
    }
  }

  private fetchMergeRequests(projects: Array<any>) {
    console.log('fetching merge requests');
    this.mergeRequests = [];
    const created = 'created_at';
    const mergeReqs$ = this.api.mergeRequests.subscribe(
      mergeRequests => {
        this.subscriptions.push(mergeReqs$);
        // const tidyMergeRequests = uniqBy(this.mergeRequests, item => item.id);
        mergeRequests.forEach(mergeRequest => {
          const project$ = this.api
            .projectByID(mergeRequest.project_id)
            .subscribe(project => {
              this.subscriptions.push(project$);
              console.log('merge requests project id -> ' + project.id);
              console.log('merge requests mergeRequest.source_branch -> ' + mergeRequest.source_branch);
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
                  // console.log('lastPipeline[updated] -> ' + lastPipeline[updated]);
                  // if (differenceInDays(new Date(lastPipeline[created]), new Date()) >= -1) {
                  this.mergeRequests.push({
                    ...mergeRequest,
                    ...{ project },
                    ...{
                      ci_status:
                        lastPipeline.length > 0
                          ? lastPipeline[0].status
                          : 'unknown',
                    },
                  });
                  const tidyMergeRequests = uniqBy(this.mergeRequests, item => item.id);
                  tidyMergeRequests.sort((o1, o2) => compareDesc(parseISO(o1.updated_at), parseISO(o2.updated_at)));
                  this.mergeRequests = tidyMergeRequests;
                // }
                });
            });
        });
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
