import { ChangeDetectorRef, Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { SvgIconRegistryService } from 'angular-svg-icon';
import { each, isEmpty } from 'lodash';
import { Memoize } from 'lodash-decorators/memoize';
import { NgxSpinnerService } from 'ngx-spinner';
import { InsightService } from './../../../services/insight-api/insight.service';
import { NotificationService } from './../../../services/notification/notification.service';
import { SettingsService } from './../../../services/settings/settings.service';

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
  selector: 'app-runner-grid',
  templateUrl: './runner-grid.component.html',
  styleUrls: ['./runner-grid.component.styl']
})
export class RunnerGridComponent implements OnInit {
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatTable, { static: false }) table: MatTable<any>;
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
  ndays = 32;

  constructor(
    protected iservice: InsightService,
    private sservice: SettingsService,
    private spinner: NgxSpinnerService,
    private notificationService: NotificationService,
    private zone: NgZone,
    private iconReg: SvgIconRegistryService,
    private changeDetectorRefs: ChangeDetectorRef
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
    // this.groupByColumns = ['date'];
  }

  ngOnInit() {
    // this.ndays = Number(this.settingsService.settings.timeRangeMatrix);
    this.fetchMatrixData(this.ndays);
    this.zone.runOutsideAngular(() => {
      setInterval(() => {
        this.clearSubscriptions();
        this.fetchMatrixData(this.ndays);
      }, this.updateInterval);
    });
  }

  ngAfterViewInit() {
    this.changeDetectorRefs.detectChanges();
  }

  private fetchMatrixData(ndays: number): any {
    let runners: any = [];
    let daydata: any = [];
    let runnerobj: any = {};
    let dayObject: any = {};
    let mdata: any = [];
    let allrunners: any = [];

    this.insightService.fetchInsightData(ndays, 'grid').subscribe(
      matrix => {
        each(matrix, (value, key) => {
          let datestring;
          each(value, (v, k) => {
            let count
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
          }
          );
          for (const r of runners) {
            let index = 0;
            each(r, (value, key) => {
              index++
              let colname = ['minus' + index];
              runnerobj = {
                'id': index,
                'date': datestring,
                'active': value.active,
                'uptime': value.uptime,
                'description': value.description,
                'ip_address': value.ip_address,
                'is_shared': value.is_shared,
                'name': value.name,
                'online': value.online,
                'status': value.status
              }
              allrunners.push(runnerobj);
            })
          }
          daydata = [];
        });
        console.log('grid data]-> \n', allrunners);
        this.matrixdata = allrunners;
        this.dataSource = new MatTableDataSource(this.matrixdata);
        this.dataSource.data = this.addGroups(this.matrixdata, this.groupByColumns);
        this.dataSource.filterPredicate = this.customFilterPredicate.bind(this);
        this.dataSource.filter = performance.now().toString();
        // this.paginator._changePageSize(this.paginator.pageSize);
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
