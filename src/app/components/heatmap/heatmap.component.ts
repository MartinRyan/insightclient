
import { AfterViewInit, Component, EventEmitter, NgZone, OnDestroy, OnInit, Output } from '@angular/core';
import { SvgIconRegistryService } from 'angular-svg-icon';
import { compareDesc, differenceInDays, differenceInWeeks, parseISO } from 'date-fns';
import { isEmpty, uniqBy } from 'lodash';
import { NgxSpinnerService } from 'ngx-spinner';

import { NotificationService } from './../../services/notification/notification.service';
import { SettingsService } from './../../services/settings/settings.service';
import { Memoize } from 'lodash-decorators/memoize';
import { InsightService } from './../../services/insight-api/insight.service'
import { Runners } from 'src/app/models/runners.model';
import { Runner } from './../../models/runner';
import { each, map, reverse, uniq } from 'lodash';

@Component({
  selector: 'app-heatmap',
  templateUrl: './heatmap.component.html',
  styleUrls: ['./heatmap.component.styl']
})
export class HeatmapComponent implements OnInit {

  xAxis: Object = {};
  yAxis: Object = {};

  heatmapData = [];

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

  paletteSettings = {
    palette: [
      { value: 0, color: '#FF3939' },
      { value: 50, color: '#E85C27' },
      { value: 100, color: '#60FF73' }
    ]
  };

  dataSourceSettings: Object = {
    isJsonData: true,
    adaptorType: 'Cell',
    xDataMapping: 'date',
    yDataMapping: 'runner',
    valueMapping: 'uptime'
  };

  cellSettings: Object = {
    border: {
      radius: 4,
      width: 1,
      color: 'white'
    },
    showLabel: false,
    format: '{value}',
  };

  public isLoading = false;
  public timeRangeRunners: number;
  private subscriptions: Array<any> = [];
  public updateInterval = 60000;
  public uptimesLive: Array<Runner> = [];
  public rlabels: Array<String> = [];


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
    const runners = []
    const uptimesArray = [];
    const labelsArray = [];
    const celldata = []

    this.api.fetchUptimes(ndays).subscribe(
      uptimes => {
        let timestring;
        let datestring;
        each(uptimes, (value, key) => {
          console.log('');
          each(value, (v, k) => {
            if (k === '_id') {
              const idobj = Object(v);
              const idtstring = idobj.$date;
              datestring = this.timestampToDate(idtstring);
            }
            if (k === 'runners') {
              runners.push(v)
            }
          }
          );
          for (const r of runners) {
          const dayd = {};
          const labeld = [];
          each(r, (value, key) => {
            const d =
            {
              'runner': value[0],
              'uptime': String(value[1]),
              'date': datestring
            }
            celldata.push(d);
          })
          console.log('cell data -> \n', celldata);
        }
        this.heatmapData = celldata;
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
  }

  private timestampToDate(timestamp) {
    const d = new Date(timestamp),
      mm = ('0' + (d.getMonth() + 1)).slice(-2),
      dd = ('0' + d.getDate()).slice(-2)
    const day = dd + '-' + mm;
    return day;
  }

  private clearSubscriptions() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }
}
