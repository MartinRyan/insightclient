import { SettingsService } from './../../services/settings/settings.service';
import { InsightService } from './../../services/insight-api/insight.service';
import { AfterViewInit, Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { format, subDays } from 'date-fns';
import { RunnersService } from 'src/app/services/gitlab-api/runners.service';
import { Runner } from './../../models/runner';
import { RunnersDataSource } from './../../models/runners-data-source.model';
import { ConditionalExpr } from '@angular/compiler';
import { MatTooltip } from '@angular/material/tooltip';
import { Memoize } from 'lodash-decorators/memoize';
import { each, isEmpty } from 'lodash';
import { NgxSpinnerService } from 'ngx-spinner';
import { NotificationService } from './../../services/notification/notification.service';
import { SvgIconRegistryService } from 'angular-svg-icon';

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
    'minus7',
    'minus6',
    'minus5',
    'minus4',
    'minus3',
    'minus2',
    'minus1',
    'now'
  ];

  // displayedColumns = [
  //   'date',
  //   'name',
  //   'description',
  //   'active',
  //   'ip_address',
  //   'is_shared',
  //   'online',
  //   'status'
  // ];

  nowminus7: any;
  nowminus6: any;
  nowminus5: any;
  nowminus4: any;
  nowminus3: any;
  nowminus2: any;
  nowminus1: any;
  now: any;

  isLoading = false;
  matrixdata = [];

  colnameArray = [
    'minus7',
    'minus6',
    'minus5',
    'minus4',
    'minus3',
    'minus2',
    'minus1',
    'now'
  ];

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
    this.matrixdata = this.fetchRunnerMatrixData(ndays);
    console.log('');
    console.log('MATRIX DATA >>>>> ', this.matrixdata);
    console.log('');
  }

  ngAfterViewInit() {
    // this.dataSource.sort = this.sort;
    // this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.matrixdata;
  }

  private fetchRunnerMatrixData(ndays: number): any {
    this.isLoading = true;
    this.spinner.show();
    let runners = [];
    const mdata = [];
    let daydata = [];
    let runnerObject = {};
    let dayObject = {};

    this.insightService.fetchRunnerMatrix(ndays).subscribe(
      matrix => {
        each(matrix, (value, key) => {
          let datestring;
          let count;
          console.log('');
          each(value, (v, k) => {
            count = 0;
            count++
            if (k === '_id') {
              const idobj = Object(v);
              const idtstring = idobj.$date;
              datestring = this.timestampToDate(idtstring);
            //   dayObject = {
            //     'id': count,
            //     'name': value[0],
            //     runnerObject
            // }
            }
            if (k === 'runners') {
              runners = [];
              runners.push(v);
            }
          }
          );
          for (const r of runners) {
            let index = 0;
            each(r, (value, key) => {
              index++
              let colname = ['minus' + index];
              let runnerArray =  [];
              // runnerObject = {
              //   'id': count,
              //   'name': value[0],
              //   [this.colnameArray[index]] : {
              //     'date': datestring,
              //     'active': String(value[2]),
              //     'description': value[0],
              //     'ip_address': value[5],
              //     'is_shared': value[6],
              //     'name': String(value[0]),
              //     'online': String(value[3]),
              //     'status': String(value[4])
              //   }
              // }
              // runnerArray.push(runnerObject);
            //   dayObject = {
            //     'id': count,
            //     'name': value[0], runnerArray
            // }
            //----------------
            runnerObject = {
              'date': datestring,
              'name': value[7],
              'active': String(value[2]),
              'description': value[0],
              'ip_address': value[5],
              'is_shared': value[6],
              'online': String(value[3]),
              'status': String(value[4])
            }
              daydata.push(runnerObject);
            })
          }
          // this.matrixdata.push(daydata);
          mdata.push(daydata);
          daydata = [];
        });
        console.log('MATRIX DATA ]-> \n', mdata);
        return mdata
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

  showData(data) {
    console.log('showData value ', data);
    return data;
  }

  getDates() {
    const now = new Date();
    this.nowminus7 = format(subDays(now, 7), 'dd MMM');
    this.nowminus6 = format(subDays(now, 6), 'dd MMM');
    this.nowminus5 = format(subDays(now, 5), 'dd MMM');
    this.nowminus4 = format(subDays(now, 4), 'dd MMM');
    this.nowminus3 = format(subDays(now, 3), 'dd MMM');
    this.nowminus2 = format(subDays(now, 2), 'dd MMM');
    this.nowminus1 = format(subDays(now, 1), 'dd MMM');
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
