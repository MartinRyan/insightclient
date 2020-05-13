import { SettingsService } from './../../services/settings/settings.service';
import { InsightService } from './../../services/insight-api/insight.service';
import { Component, NgZone, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { Memoize } from 'lodash-decorators/memoize';
import { each, isEmpty } from 'lodash';
import { NgxSpinnerService } from 'ngx-spinner';
import { NotificationService } from './../../services/notification/notification.service';
import { SvgIconRegistryService } from 'angular-svg-icon';

export class Group {
  level = 0;
  parent: Group;
  expanded = true;
  totalCounts = 0;
  get visible(): boolean {
    return !this.parent || (this.parent.visible && this.parent.expanded);
  }
}

@Component({
  selector: 'app-matrix',
  templateUrl: './matrix.component.html',
  styleUrls: ['./matrix.component.styl']
})
export class MatrixComponent implements OnInit {
  public dataSource = new MatTableDataSource<any | Group>([]);
  private subscriptions: Array<any> = [];
  public updateInterval = 60000;
  columns: any[];
  displayedColumns: string[];
  groupByColumns: string[] = [];
  insightService: InsightService;
  settingsService: SettingsService;
  isLoading = false;
  matrixdata: any[];

  constructor(
    protected iservice: InsightService,
    private sservice: SettingsService,
    private spinner: NgxSpinnerService,
    private notificationService: NotificationService,
    private zone: NgZone,
    private iconReg: SvgIconRegistryService
  ) {
    this.insightService = iservice;
    this.settingsService = sservice;
    this.columns = [{
      field: 'id'
    }, {
      field: 'date'
    }, {
      field: 'name'
    }, {
      field: 'description'
    }, {
      field: 'uptime'
    }, {
      field: 'ip_address'
    }, {
      field: 'is_shared'
    }, {
      field: 'online'
    }, {
      field: 'status'
    }];
    this.displayedColumns = this.columns.map(column => column.field);
    this.groupByColumns = ['date'];
  }

  ngOnInit() {
    // // const ndays = Number(this.settingsService.settings.timeRangeRunners);
    const ndays = 7 // for testing
    this.fetchMatrixData(ndays);
    this.zone.runOutsideAngular(() => {
      setInterval(() => {
        this.clearSubscriptions();
        this.fetchMatrixData(ndays);
      }, this.updateInterval);
    });
  }

  ngAfterViewInit() {
    // this.dataSource.sort = this.sort;
    // this.dataSource.paginator = this.paginator;
    // this.table.dataSource = this.matrixdata;
    // this._alldata = this.matrixdata;
    // this.dataSource.data = this.addGroups(this.matrixdata, this.groupByColumns);
    // this.dataSource.filterPredicate = this.customFilterPredicate.bind(this);
    // this.dataSource.filter = performance.now().toString();
    
  }

  private loadMatrix():any {
    this.isLoading = true;
    this.spinner.show();
    const ndays = 7 // for testing
    const data = this.fetchMatrixData(ndays);
    data.forEach((item, index) => {
      item.id = index + 1;
    });
    this.matrixdata = data;
    this.dataSource.data = this.addGroups(this.matrixdata, this.groupByColumns);
    this.dataSource.filterPredicate = this.customFilterPredicate.bind(this);
    this.dataSource.filter = performance.now().toString();
  }

  // private fetchMatrix(ndays: number): any {
  //   this.insightService.fetchRunnerMatrix(7)
  //     .subscribe(
  //       (data: any) => {
  //         data.data.forEach((item, index) => {
  //           item.id = index + 1;
  //         });
  //         this._alldata = data.data;
  //         this.dataSource.data = this.addGroups(this._alldata, this.groupByColumns);
  //         this.dataSource.filterPredicate = this.customFilterPredicate.bind(this);
  //         this.dataSource.filter = performance.now().toString();
  //       },
  //       (err: any) => console.log(err)
  //     );
  // }

  private fetchMatrixData(ndays: number): any {
    let runners: any = [];
    let daydata: any = [];
    let runnerObject: any = {};
    let dayObject: any = {};
    let mdata: any = [];
    let allrunners: any = [];

    this.insightService.fetchRunnerMatrix(ndays).subscribe(
      matrix => {
        each(matrix, (value, key) => {
          let datestring;
          console.log('');
          each(value, (v, k) => {
            let count
            count++
            if (k === '_id') {
              const idobj = Object(v);
              const idtstring = idobj.$date;
              datestring = this.timestampToDate(idtstring);
              dayObject = {
                'id': count,
                'name': value[0],
                runnerObject
              }
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
              runnerObject = {
                // 'id': index,
                // 'name': value[0],
                // [this.colnameArray[index]] : {
                'id': index,
                'date': datestring,
                'active': String(value[2]),
                'uptime': String(value[1]),
                'description': value[0],
                'ip_address': value[5],
                'is_shared': value[6],
                'name': String(value[0]),
                'online': String(value[3]),
                'status': String(value[4])
              }
              // }
              daydata.push(runnerObject);
              allrunners.push(runnerObject);
            })
          }
          // mdata.push(daydata);
          daydata = [];
        });
        console.log('');
        console.log('ALL RUNNERS ]-> \n', allrunners);
        console.log('');
        mdata.forEach((item, index) => {
          item.id = index + 1;
        });
        this.matrixdata = allrunners;
        // this.matrixdata = mdata;
        this.dataSource.data = this.addGroups(this.matrixdata, this.groupByColumns);
        this.dataSource.filterPredicate = this.customFilterPredicate.bind(this);
        this.dataSource.filter = performance.now().toString()
        // return mdata
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

  groupBy(event, column) {
    event.stopPropagation();
    this.checkGroupByColumn(column.field, true);
    this.dataSource.data = this.addGroups(this.matrixdata, this.groupByColumns);
    this.dataSource.filter = performance.now().toString();
  }

  checkGroupByColumn(field, add) {
    let found = null;
    for (const column of this.groupByColumns) {
      if (column === field) {
        found = this.groupByColumns.indexOf(column, 0);
      }
    }
    if (found != null && found >= 0) {
      if (!add) {
        this.groupByColumns.splice(found, 1);
      }
    } else {
      if (add) {
        this.groupByColumns.push(field);
      }
    }
  }

  unGroupBy(event, column) {
    event.stopPropagation();
    this.checkGroupByColumn(column.field, false);
    this.dataSource.data = this.addGroups(this.matrixdata, this.groupByColumns);
    this.dataSource.filter = performance.now().toString();
  }

  // below is for grid row grouping
  customFilterPredicate(data: any | Group, filter: string): boolean {
    return (data instanceof Group) ? data.visible : this.getDataRowVisible(data);
  }

  getDataRowVisible(data: any): boolean {
    const groupRows = this.dataSource.data.filter(
      row => {
        if (!(row instanceof Group)) {
          return false;
        }
        let match = true;
        this.groupByColumns.forEach(column => {
          if (!row[column] || !data[column] || row[column] !== data[column]) {
            match = false;
          }
        });
        return match;
      }
    );

    if (groupRows.length === 0) {
      return true;
    }
    const parent = groupRows[0] as Group;
    return parent.visible && parent.expanded;
  }

  groupHeaderClick(row) {
    row.expanded = !row.expanded;
    this.dataSource.filter = performance.now().toString();  // bug here need to fix
  }

  addGroups(data: any[], groupByColumns: string[]): any[] {
    const rootGroup = new Group();
    rootGroup.expanded = true;
    return this.getSublevel(data, 0, groupByColumns, rootGroup);
  }

  getSublevel(data: any[], level: number, groupByColumns: string[], parent: Group): any[] {
    if (level >= groupByColumns.length) {
      return data;
    }
    const groups = this.uniqueBy(
      data.map(
        row => {
          const result = new Group();
          result.level = level + 1;
          result.parent = parent;
          for (let i = 0; i <= level; i++) {
            result[groupByColumns[i]] = row[groupByColumns[i]];
          }
          return result;
        }
      ),
      JSON.stringify);

    const currentColumn = groupByColumns[level];
    let subGroups = [];
    groups.forEach(group => {
      const rowsInGroup = data.filter(row => group[currentColumn] === row[currentColumn]);
      group.totalCounts = rowsInGroup.length;
      const subGroup = this.getSublevel(rowsInGroup, level + 1, groupByColumns, group);
      subGroup.unshift(group);
      subGroups = subGroups.concat(subGroup);
    });
    return subGroups;
  }

  uniqueBy(a, key) {
    const seen = {};
    return a.filter((item) => {
      const k = key(item);
      return seen.hasOwnProperty(k) ? false : (seen[k] = true);
    });
  }

  isGroup(index, item): boolean {
    return item.level;
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

  ngOnDestroy() {
    this.clearSubscriptions();
  }

  private clearSubscriptions() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }
}
