import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { NotificationService } from './../../services/notification/notification.service';
import { SettingsService } from './../../services/settings/settings.service';
import { GitlabApiService } from './../../services/gitlab-api/gitlab-api.service';
import { NgxSpinnerService } from 'ngx-spinner';
 

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
    this.fetchdata();
    this.zone.runOutsideAngular(() => {
      setInterval(() => {
        this.clearSubscriptions();
        this.fetchdata();
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

  private clearSubscriptions() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }
}