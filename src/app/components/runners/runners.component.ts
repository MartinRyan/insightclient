import { AfterViewInit, Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { SvgIconRegistryService } from 'angular-svg-icon';
import { format, subDays } from 'date-fns';
import { each, isEmpty } from 'lodash';
import { Memoize } from 'lodash-decorators/memoize';
import { NgxSpinnerService } from 'ngx-spinner';
import { RunnersService } from 'src/app/services/gitlab-api/runners.service';
import { Runner } from './../../models/runner';
import { RunnersDataSource } from './../../models/runners-data-source.model';
import { InsightService } from './../../services/insight-api/insight.service';
import { NotificationService } from './../../services/notification/notification.service';
import { SettingsService } from './../../services/settings/settings.service';
import { TableDataSource } from '../table/table-datasource';

@Component({
  selector: 'app-runners',
  templateUrl: './runners.component.html',
  styleUrls: ['./runners.component.styl']
})
export class RunnersComponent implements AfterViewInit, OnInit {
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatTable, { static: false }) table: MatTable<Runner>;
  dataSource: RunnersDataSource;
  runnerService: RunnersService;
  insightService: InsightService;
  settingsService: SettingsService;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = [
    'id',
    'name',
    'minus6',
    'minus5',
    'minus4',
    'minus3',
    'minus2',
    'minus1',
    // 'minus0',
    'now'
  ];

  nowminus6: any;
  nowminus5: any;
  nowminus4: any;
  nowminus3: any;
  nowminus2: any;
  nowminus1: any;
  nowminus0: any;
  now: any;

  isLoading = false;
  matrixdata = [];

  constructor(
    private iservice: InsightService,
    private sservice: SettingsService,
    private spinner: NgxSpinnerService,
    private notificationService: NotificationService,
    private zone: NgZone,
    private iconReg: SvgIconRegistryService
  ) {
    this.insightService = iservice;
    this.settingsService = sservice;
  }

  ngOnInit() {
    this.getDates();
    // const ndays = Number(this.settingsService.settings.timeRangeRunners);
    const ndays = 7 // for testing
    this.matrixdata = this.fetchRunners(ndays);
    this.dataSource = new RunnersDataSource();
  }

  ngAfterViewInit() {
    // this.dataSource.sort = this.sort;
    // this.dataSource.paginator = this.paginator;
    // this.table.dataSource = this.matrixdata;
    // this.table.dataSource = this.dataSource;
  }

  private fetchRunners(ndays: number): any {
    let runners: any = [];
    let runnerobj: any = {};
    let allrunners: any = [];
    let matrixdata: any = [];
    let nrunners: number = 0;
    let runnergroup: any = {};
    let sorted_runners: any = [];
    let datestring: string;
    let index = 0;
    let nameid = -1;
    let idcount = 0;
    let rowobj = {};

    this.insightService.fetchInsightData(ndays, 'runners').subscribe(
      matrix => {
        each(matrix, (value, key) => {
          idcount++
          index++
          nameid++
          each(value, (v, k) => {
            if (k === '_id') {
              const idobj = Object(v);
              const idtstring = idobj.$date;
              datestring = this.timestampToDate(idtstring);
            }
            if (k === 'runners') {
              runners = [];
              runners.push(v);
              console.log('--- RUNNERS ----', runners);
              for (const run of runners) {
                each(run, (val, ke) => {
                  const name = val[0];
                  runnerobj = {
                    'id': Number(idcount),
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
                  console.log('--- runnerobj ----', runnerobj);
                  ['minus' + nameid]
                  let colname;
                  nameid == 0 ? colname = 'now' : colname = ['minus' + nameid];
                  rowobj = {
                    'id': index,
                    'name': name,
                    [colname]: runnerobj
                  }
                  console.log('--- rowobj ----', rowobj);
                  allrunners.push(rowobj);
                })
              }
            }
            if (k === 'nrunners') {
              nrunners = Number(v[0]);
            }
          }
          );
        });
        console.log('--- allrunners ----', allrunners);
        sorted_runners = this.groupby(allrunners, 'name');
        console.log('--- sorted_runners ----', sorted_runners);
        for (let i = 0; i < nrunners; i++) {
          each(sorted_runners, (prop, obj) => {
            i++
            runnergroup = {
              'id': i,
              'name': obj,
              prop
            }
            console.log('runnergroup: ->', runnergroup);
            matrixdata.push(runnergroup);
          })
        }
        console.log('matrixdata ]-> \n', matrixdata);
        this.matrixdata = matrixdata;
        this.table.dataSource = this.matrixdata;
        return matrixdata
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

  showData(data) {
    console.log('showData value ', data);
    return data;
  }

  getDates() {
    const now = new Date();
    // this.nowminus7 = format(subDays(now, 7), 'dd MMM');
    this.nowminus6 = format(subDays(now, 6), 'dd MMM');
    this.nowminus5 = format(subDays(now, 5), 'dd MMM');
    this.nowminus4 = format(subDays(now, 4), 'dd MMM');
    this.nowminus3 = format(subDays(now, 3), 'dd MMM');
    this.nowminus2 = format(subDays(now, 2), 'dd MMM');
    this.nowminus1 = format(subDays(now, 1), 'dd MMM');
    // this.nowminus0 = format(now, 'dd MMM');
    this.now = format(now, 'dd MMM');
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

  @Memoize
  getIcon(value) {
    let icon = '';
    if (value === 'active') {
      icon = 'done_outline';
    } else if (value === 'online') {
      icon = 'done';
    } else if (value === 'paused') {
      icon = 'error';
    } else if (value === 'offline') {
      icon = 'offline_bolt';
    } else if (isEmpty(value)) {
      icon = 'warning';
    }
    return icon;
  }

  // if a historical day has no incident then
  // a normal operation icon is used (tick) otherwise icons for disruption
  // or service outage can be used

  @Memoize
  getIconHistorical(value) {
    let icon = '';
    if (value === 'normal_operation') {
      icon = 'done_outline';
    } else if (value === 'outage') {
      icon = 'offline_bolt';
    } else if (value === 'disruption') {
      icon = 'warning';
    } else if (isEmpty(value)) {
      icon = 'warning';
    }
    return icon;
  }

  getStyle(value) {
    let style = '';
    if (value === 'active') {
      style = 'mat-mini-fab material-icons color_green';
    } else if (value === 'online') {
      style = 'mat-mini-fab material-icons color_orange';
    } else if (value === 'paused') {
      style = 'mat-mini-fab material-icons color_blue';
    } else if (value === 'offline') {
      style = 'mat-mini-fab material-icons color_red';
    } else if (isEmpty(value)) {
      style = 'mat-mini-fab material-icons color_grey';
    }
    return style;
  }
}
