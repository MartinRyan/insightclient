import { Runner } from './../../../models/runner';
import { ChangeDetectorRef, Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
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


@Component({
  selector: 'app-matrix-grid',
  templateUrl: './matrix-grid.component.html',
  styleUrls: ['./matrix-grid.component.styl']
})
export class MatrixGridComponent implements OnInit {
  dataSource = new MatTableDataSource();
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatTable, { static: false }) table: MatTable<any>;
  private subscriptions: Array<any> = [];
  public updateInterval = 60000;
  columns: any[];
  displayedColumns: string[];
  groupByColumns: string[] = [];
  isLoading = false;
  matrixdata: Runner[];
  ndays = 1;

  constructor(
    private insightService: InsightService,
    private settingsService: SettingsService,
    private notificationService: NotificationService,
    private spinner: NgxSpinnerService,
    private zone: NgZone,
    private iconReg: SvgIconRegistryService) {

    this.displayedColumns = [
      'id',
      'date',
      'name',
      'description',
      'uptime',
      'ip_address',
      'is_shared',
      'online',
      'status'
    ];
  }

  ngOnInit() {
    this.fetchData(1);
    this.zone.runOutsideAngular(() => {
      setInterval(() => {
        this.clearSubscriptions();
        this.fetchData(1);
      }, this.updateInterval);
    });
  }

  private fetchData(ndays: number) {
    this.isLoading = true;
    this.spinner.show();
    let runners = [];
    let runnerdata = [];
    let idtstring;
    let datestring;

    this.insightService.fetchInsightData(ndays, 'today').subscribe(
      data => {
        each(data, (value, key) => {
          console.log('data: ', JSON.stringify(data));
          console.log('key -> ', key);
          console.log('value -> ', value);
          const dayd = {};
          // each(value, (v, k) => {
          // if (k === '_id') {
          //   const idobj = Object(v);
          //   console.log('objj: ', idobj);
          //   const idtstring = idobj.$date;
          //   console.log('idtstring: ', idtstring);
          //   // datestring = this.timestampToDate(idtstring);
          // }
          // if (k === 'runners') {
          //   runners = [];
          //   runners.push(v);
          //   console.log('runners: ', runners);
          // }
          // });
          // for (const r of runners) {
          //   const dayd = {};
          //   each(value, (prop, obj) => {
          const d = {
            'id': value.id,
            'date': this.timestampToDate(value.timestamp.$date),
            'timestamp': value.timestamp.$date,
            'name': value.name,
            'uptime': value.uptime,
            'description': value.description,
            'ip_address': value.ip_address,
            'is_shared': value.is_shared,
            'online': value.online,
            'status': value.status,
            'active': value.active
          }
          //     console.log('runnerdata -> ', runnerdata);
          runnerdata.push(d as Runner);
          //   })
          // }
        });
        console.log('runner data -> ', runnerdata);
        console.log('runnerdata: ', JSON.stringify(runnerdata))
        // this.matrixdata = runnerdata;
        // this.dataSource.data = runnerdata;
        this.dataSource = new MatTableDataSource(runnerdata);
        // this.dataSource.filter = performance.now().toString();
      },
      err => {
        this.isLoading = false;
        this.spinner.hide();
      }
    );
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
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
