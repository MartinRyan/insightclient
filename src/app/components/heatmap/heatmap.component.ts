
import { AfterViewInit, Component, EventEmitter, NgZone, OnDestroy, OnInit, Output } from '@angular/core';
import { SvgIconRegistryService } from 'angular-svg-icon';
import { compareDesc, differenceInDays, differenceInWeeks, parseISO } from 'date-fns';
import { isEmpty, uniqBy } from 'lodash';
import { NgxSpinnerService } from 'ngx-spinner';

import { NotificationService } from './../../services/notification/notification.service';
import { SettingsService } from './../../services/settings/settings.service';
import { Memoize } from 'lodash-decorators/memoize';
import {InsightService} from './../../services/insight-api/insight.service'
import { Runners } from 'src/app/models/runners.model';
import { Runner } from './../../models/runner';
import { each, map, reverse, uniq } from 'lodash';

@Component({
  selector: 'app-heatmap',
  templateUrl: './heatmap.component.html',
  styleUrls: ['./heatmap.component.styl']
})
export class HeatmapComponent implements OnInit {
  // yAxis = {
  //   labels: ['shared-runner-1', 'shared-runner-2', 'shared-runner-3', 'shared-runner-4', 'shared-runner-5', 'shared-runner-6',
  //   'shared-runner-7', 'runner-1', 'runner-2', 'runner-3', 'runner-4', 'runner-5', 'runner-6'],
  // };

  xAxis = {
  //   labels: ['Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'],
  };

titleSettings = {
    text: '',
    textStyle: {
        size: '15px',
        fontWeight: '500',
        fontStyle: 'Normal'
}
};

legendSettings = {
    visible: true,
    position: 'Right',
    showLabel: true,
    height: '150px'
};

cellSettings = {
  showLabel: false,
  format: '{value}'
};

paletteSettings = {
  palette: [
  { value: 0, color: '#FF3939' },
  { value: 50, color: '#E85C27' },
  { value: 100, color: '#60FF73' }
  ]
};

public isLoading = false;
public timeRangeRunners: number;
private subscriptions: Array<any> = [];
public updateInterval = 60000;
public uptimesLive: Array<Runner> = [];
public rlabels: Array<String> = [];
yAxis = {}


  constructor(
    private api: InsightService,
    private settingsService: SettingsService,
    private notificationService: NotificationService,
    private spinner: NgxSpinnerService,
    private zone: NgZone,
    private iconReg: SvgIconRegistryService
    ) { }

  ngOnInit() {
    // this.timeRangeRunners = Number(this.settingsService.settings.timeRangeRunners);
    this.timeRangeRunners = 30 // for testing
    console.log('ngOnInit uptimes range: ', this.timeRangeRunners, ' days');
    this.fetchUptimesRangeDays(this.timeRangeRunners);
      this.zone.runOutsideAngular(() => {
        setInterval(() => {
          this.clearSubscriptions();
          this.fetchUptimesRangeDays(this.timeRangeRunners);
        }, this.updateInterval);
      });
  }

  // @Memoize
  private fetchUptimesRangeDays(ndays: number) {
    this.isLoading = true;
    this.spinner.show();
    console.log('fetching uptimes range: ', ndays, ' days');
    console.log('');
    const daydataArray: Array<any> = [];
    // const uptimesArray: Array<Runner> = [];
    const runners = []
    const uptimesArray = [];
    const labelsArray = [];
    
      this.api.fetchUptimes(ndays).subscribe(
        uptimes => {
          each(uptimes,  (value, key) => {
            each(value,  (v, k) => {
              if(k === 'timestamp') {
                // console.log('k timestamp -> ', v)
              }
              if(k === 'runners') {
                runners.push(v)
              }
              }
            );
          });
          for (const r of runners) {
            const dayd = [];
            const labeld = [];
            each(r,  (value, key) => {
              // labeld.push(
              //   {
              //     runner: value[0],
              //     uptime: value[1]
              //   });
              labeld.push(value[0]);
              // dayd.push(value[0]);
              dayd.push(value[1]);
            })
            uptimesArray.push(dayd);
            labelsArray.push(labeld);
          }
          this.uptimesLive = uptimesArray;
          this.yAxis = {labels: reverse(uniq(labelsArray[0]))};
          // console.log('uptimes -> uptimesLive ', this.uptimesLive);
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

  private clearSubscriptions() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

}
