import { Component, NgZone, OnInit } from '@angular/core';
import { SvgIconRegistryService } from 'angular-svg-icon';
import { each } from 'lodash';
// import { Memoize } from 'lodash-decorators/memoize';
import { NgxSpinnerService } from 'ngx-spinner';
import { Runner } from './../../../models/runner';
import { InsightService } from './../../../services/insight-api/insight.service';
import { NotificationService } from './../../../services/notification/notification.service';
import { SettingsService } from './../../../services/settings/settings.service';

@Component({
  selector: 'app-runner-heatmap',
  templateUrl: './runner-heatmap.component.html',
  styleUrls: ['./runner-heatmap.component.styl']
})
export class RunnerHeatmapComponent implements OnInit {

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
    showLabel: false,
    height: '400px'
  };

  paletteSettings = {
    palette: [
      { value: 0, color: '#FF0600' }, // red
      { value: 50, color: '#FF3000' }, // red
      { value: 90, color: '#F0930A' }, // orange
      { value: 99, color: '#FFE205' }, // yellow
      { value: 100, color: '#00F071' }, // green
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
  matrixdata: any[];


  constructor(
    private insightService: InsightService,
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

  private fetchMatrixData(ndays: number): any {
    let runners: any = [];
    let daydata: any = [];
    let runnerobj: any = {};
    let mdata: any = [];
    let allrunners: any = [];
    let matrixdata: any = [];
    let nrunners: Number = 0;
    let runnergroup: any = {};
    let sorted_runners: any = [];

    this.insightService.fetchInsightData(ndays, 'runners').subscribe(
      matrix => {
        each(matrix, (value, key) => {
          let datestring;
          let index;
          each(value, (v, k) => {
            let count;
            count++
            if (k === '_id') {
              const idobj = Object(v);
              const idtstring = idobj.$date;
              datestring = this.timestampToDate(idtstring);
            }
            if (k === 'runners') {
              runners = [];
              runners.push(v);
            }
            if (k === 'nrunners') {
              nrunners = Number(v[0]);
            }
            for (const r of runners) {
              index = 0;
              each(r, (val, ke) => {
                index++
                // let colname = ['minus' + index];
                runnerobj = {
                  'id': index,
                  'date': datestring,
                  'active': String(val[2]),
                  'uptime': String(val[1]),
                  'description': val[0],
                  'ip_address': val[5],
                  'is_shared': val[6],
                  'name': String(val[0]),
                  'online': String(val[3]),
                  'status': String(val[4])
                }
                allrunners.push(runnerobj);
              })
            }
          }
          );
        });
        sorted_runners = this.groupby(allrunners, 'name');
        for (let i = 0; i < nrunners; i++) {
          each(sorted_runners, (prop, obj) => {
            i++
            runnergroup = {
              'id': i,
              'name': obj,
              ['minus' + i]:
                prop
            }
            console.log('runnergroup: ->', runnergroup);
            matrixdata.push(runnergroup);
          })
        }
        console.log('matrixdata ]-> \n', matrixdata);
        this.heatmapData = matrixdata;
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

  groupby = (array, key) => {
    return array.reduce((result, currentValue) => {
      (result[currentValue[key]] = result[currentValue[key]] || []).push(
        currentValue
      );
      return result;
    }, {});
  };


  // @Memoize
  private fetchUptimesRangeDays(ndays: number) {
    this.isLoading = true;
    this.spinner.show();
    let runners = [];
    let celldata = [];

    this.insightService.fetchInsightData(ndays, 'heatmap').subscribe(
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
              runners = [];
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
                'uptime': value[1],
                'date': datestring
              }
              celldata.push(d);
              console.log('heatmap runner -> ', d);
            })
          }
        });
        this.heatmapData = celldata;
        celldata = [];
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
