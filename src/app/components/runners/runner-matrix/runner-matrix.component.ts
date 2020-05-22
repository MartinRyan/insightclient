import { MatExpansionModule } from '@angular/material/expansion';
import { AfterViewInit, Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { SvgIconRegistryService } from 'angular-svg-icon';
import { format, subDays } from 'date-fns';
import { each, isEmpty, keyBy } from 'lodash';
import { Memoize } from 'lodash-decorators/memoize';
import { NgxSpinnerService } from 'ngx-spinner';
// import { Runner } from './../../../models/runner';
import { RunnersDataSource } from './../../../models/runners-data-source.model';
import { InsightService } from './../../../services/insight-api/insight.service';
import { NotificationService } from './../../../services/notification/notification.service';
import { SettingsService } from './../../../services/settings/settings.service';

export interface Runner {
  id: number;
  name: string;
  minus6: object;
  minus5: object;
  minus4: object;
  minus3: object;
  minus2: object;
  minus1: object;
  now: object;
  status: string;
  active: boolean;
  description: string;
  ip_address: string;
  is_shared: boolean;
  online: string;
  uptime: number;
}

@Component({
  selector: 'app-runner-matrix',
  templateUrl: './runner-matrix.component.html',
  styleUrls: ['./runner-matrix.component.styl']
})


export class RunnerMatrixComponent implements AfterViewInit, OnInit {
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatTable, { static: false }) table: MatTable<Runner>;
  dataSource: RunnersDataSource;
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
  private subscriptions: Array<any> = [];
  public updateInterval = 60000;

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
    this.dataSource = new RunnersDataSource();
    // const ndays = Number(this.settingsService.settings.timeRangeRunners);
    const ndays = 7 // for testing
    this.fetchRunnersPrevious(ndays);
    this.zone.runOutsideAngular(() => {
      setInterval(() => {
        this.clearSubscriptions();
        this.fetchRunnersPrevious(ndays);
      }, this.updateInterval);
    });
  }

  ngAfterViewInit() {
    // this.dataSource.sort = this.sort;
    // this.dataSource.paginator = this.paginator;
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
    let spliced_runners: any = [];
    let datestring: string;
    let index = 0;
    let nameid = -1;
    let idcount = 0;
    let rowobj = {};
    let rowgroup = [];

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
              for (const run of runners) {
                each(run, (val, ke) => {
                  const name = val.name
                  let colname;
                  nameid == 0 ? colname = 'now' : colname = ['minus' + nameid];
                  runnerobj = {
                    'column': colname,
                    'id': Number(idcount),
                    'date': datestring,
                    'active': val.active,
                    'uptime': val.uptime,
                    'description': val.description,
                    'ip_address': val.ip_address,
                    'is_shared': val.is_shared,
                    'name': val.name,
                    'online': val.online,
                    'status': val.status
                  }
                  allrunners.push(runnerobj);
                })
              }
            }
            if (k === 'nrunners') {
              nrunners = Number(v[0]);
            }
          }
          );
        });
        sorted_runners = this.groupby(allrunners, 'name');
        for (let i = 0; i < nrunners; i++) {
          each(sorted_runners, (prop, obj) => {
            i++
            const runner = keyBy(prop, 'column');
            runnergroup = {
              'id': i,
              'name': obj,
              runner
            }
            matrixdata.push(runnergroup);
          })
        }
        console.log('matrixdata ]-> \n', matrixdata);
        this.matrixdata = matrixdata;
        this.table.dataSource = matrixdata;
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


  private fetchRunnersPrevious(ndays: number): any {
    let runners: any = [];
    let runnerobj: any = {};
    let allrunners: any = [];
    let matrixdata: any = [];
    let nrunners: number = 0;
    let runnergroup: any = {};
    let sorted_runners: any = [];
    let spliced_runners: any = [];
    let datestring: string;
    let index = 0;
    let nameid = -1;
    let idcount = 0;
    let rowobj = {};
    let rowgroup = [];
    let name;
    let colname;
    let emptyobj;
    let number_empty;

    this.insightService.fetchInsightData(ndays, 'matrix').subscribe(
      matrix => {
        console.log('matrix: ', matrix);
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
              number_empty = nrunners - runners.length;
              // if (runners.length < nrunners) {
              //   console.log('empty runner');
              //   const number_empty = nrunners - runners.length;
              //   console.log('empty to replace = ', number_empty);
                
                // for(let i=0; i < number_empty; i++) {
                //   let emptyobj = {
                //     'name': 'empty'
                //   };
                //   runners.push(emptyobj);
                // }
              // }
              for (const run of runners) {
                each(run, (val, ke) => {
                  // if(number_empty = 0) { 
                  // name = val.name;
                  nameid == 0 ? colname = 'now' : colname = ['minus' + nameid];
                  runnerobj = {
                    'column': colname,
                    'id': Number(idcount),
                    'date': datestring,
                    'active': val.active,
                    'uptime': val.uptime,
                    'description': val.description,
                    'ip_address': val.ip_address,
                    'is_shared': val.is_shared,
                    'name': val.name,
                    'online': val.online,
                    'status': val.status
                  }
                // } else {
                //   console.log('empty runner');
                //   nameid == 0 ? colname = 'now' : colname = ['minus' + nameid];
                //     let active;
                //     let uptime;
                //     let description;
                //     let ip_address;
                //     let is_shared;
                //     let name;
                //     let online;
                //     let status;

                //     !isEmpty(val.active) ? active = val.active: active = '';
                //     !isEmpty(val.uptime) ? uptime = val.uptime: uptime = '';
                //     !isEmpty(val.description) ? description = val.description: description = '';
                //     !isEmpty(val.ip_address) ? ip_address = val.ip_address: is_shared = '';
                //     !isEmpty(val.is_shared) ? is_shared = val.is_shared: active = '';
                //     !isEmpty(val.name) ? name = val.name: name = '';
                //     !isEmpty(val.online) ? online = val.online: online = '';
                //     !isEmpty(val.status) ? status = val.status: status = '';

                //   runnerobj = {
                //     'column': colname,
                //     'id': Number(idcount),
                //     'date': datestring,
                //     'active': active,
                //     'uptime': uptime,
                //     'description': description,
                //     'ip_address': ip_address,
                //     'is_shared': is_shared,
                //     'name': name,
                //     'online': online,
                //     'status': status
                //   }
                //   for (let i=0; i < number_empty; i++) {
                    
                //     console.log('replacement object \n',runnerobj);
                //     runners.push(runnerobj);
                //   }
                // }
                  allrunners.push(runnerobj);
                })
              }
            }
            if (k === 'nrunners') {
              nrunners = Number(v[0]);
            }
          }
          );
        });
        sorted_runners = this.groupby(allrunners, 'name');
        for (let i = 0; i < nrunners; i++) {
          each(sorted_runners, (prop, obj) => {
            i++
            const runner = keyBy(prop, 'column');
            runnergroup = {
              'id': i,
              'name': obj,
              runner
            }
            matrixdata.push(runnergroup);
          })
        }
        console.log('matrixdata ]-> \n', matrixdata);
        console.log('matrixdata ]-> \n', JSON.stringify(matrixdata));
        this.matrixdata = matrixdata;
        this.table.dataSource = matrixdata;
        // this.table.dataSource = this.RUNNER_DATA;
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

  private fetchRunners050wip(ndays: number): any {
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
                  runnerobj = {
                    // [this.colnameArray[index]:
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
              // ['minus' + i]:
                prop
            }
            console.log('runnergroup: ->', runnergroup);
            matrixdata.push(runnergroup);
          })
        }
        console.log('matrixdata ]-> \n', matrixdata);
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

  showData(data) {
    console.log('showData value ', data);
    return data;
  }

  getDates() {
    const now = new Date();
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
    if(isEmpty(value)) {
      icon = '';
    }
    else if (value === 'active') {
      icon = 'done_outline';
    } else if (value === 'online') {
      icon = 'done';
    } else if (value === 'paused') {
      icon = 'error';
    } else if (value === 'offline') {
      icon = 'offline_bolt';
    } else {
      icon = '';
    }
    return icon;
  }

  // if a historical day has no incident then
  // a normal operation icon is used (tick) otherwise icons for disruption
  // or service outage can be used

  @Memoize
  getIconHistorical(value) {
    let icon = '';
    if (isEmpty(value)) {
      icon = '';
    }
    else if (value === 'normal_operation') {
      icon = 'done_outline';
    } else if (value === 'outage') {
      icon = 'offline_bolt';
    } else if (value === 'disruption') {
      icon = 'warning';
    } else {
      icon = '';
    }
    return icon;
  }

  getStyle(value) {
    let style = '';
    if (isEmpty(value)) {
      style = 'mat-mini-fab material-icons color_grey';
    } else if (value === 'active') {
      style = 'mat-mini-fab material-icons color_green';
    } else if (value === 'online') {
      style = 'mat-mini-fab material-icons color_orange';
    } else if (value === 'paused') {
      style = 'mat-mini-fab material-icons color_blue';
    } else if (value === 'offline') {
      style = 'mat-mini-fab material-icons color_red';
    } else {
      style = 'mat-mini-fab material-icons color_grey';
    }
    return style;
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

