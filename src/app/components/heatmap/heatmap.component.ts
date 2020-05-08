
import { Component, NgZone, OnInit } from '@angular/core';
import { SvgIconRegistryService } from 'angular-svg-icon';
import { each } from 'lodash';
// import { Memoize } from 'lodash-decorators/memoize';
import { NgxSpinnerService } from 'ngx-spinner';
import { Runner } from './../../models/runner';
import { InsightService } from './../../services/insight-api/insight.service';
import { NotificationService } from './../../services/notification/notification.service';
import { SettingsService } from './../../services/settings/settings.service';


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
      { value: 0, color: '#FF3000' }, // red
      { value: 80, color: '#F0930A' }, // orange
      { value: 90, color: '#FFE205' }, // yellow
      { value: 99, color: '#74EB21' }, // green
      { value: 100, color: '#00F071' }, //  very green
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
    const runners = []
    const celldata = []

    this.api.fetchUptimes(ndays).subscribe(
      uptimes => {
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
            each(r, (value, key) => {
              const d =
              {
                'runner': value[0],
                'uptime': String(value[1]),
                'date': datestring
              }
              celldata.push(d);
            })
          }
        });
        this.heatmapData = celldata;
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
    const date = new Date(timestamp);
    const datestring = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
      .toISOString()
      .split('T')[0];
    const month = datestring.split('-')[1];
    const day = datestring.split('-')[2];
    return [day, month].join('-');
  }

  ngOnDestroy() {
    this.clearSubscriptions();
  }

  private clearSubscriptions() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }
}
