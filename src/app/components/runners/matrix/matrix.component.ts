import { Component, NgZone, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { SvgIconRegistryService } from 'angular-svg-icon';
import { each, isEmpty } from 'lodash';
import { Memoize } from 'lodash-decorators/memoize';
import { NgxSpinnerService } from 'ngx-spinner';
import { Runner } from './../../../models/runner';
import { InsightService } from './../../../services/insight-api/insight.service';
import { NotificationService } from './../../../services/notification/notification.service';
import { SettingsService } from './../../../services/settings/settings.service';

@Component({
  selector: 'app-matrix',
  templateUrl: './matrix.component.html',
  styleUrls: ['./matrix.component.styl']
})
export class MatrixComponent implements OnInit {
  dataSource = new MatTableDataSource();
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatTable, { static: false }) table: MatTable<Runner>;
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
    private iconReg: SvgIconRegistryService,
    private changeDetectorRefs: ChangeDetectorRef) {

    this.displayedColumns = [
      'id',
      'status',
      'name',
      'active',
      // 'date',
      'timestamp',
      'description',
      'uptime',
      'ip_address',
      'is_shared',
      'online',
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
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private fetchData(ndays: number) {
    this.isLoading = true;
    this.spinner.show();
    let runnerdata = [];
    let index = 0;

    this.insightService.fetchInsightData(ndays, 'today').subscribe(
      data => {
        each(data, (value, key) => {
          index++
          const runner = {
            'id': index,
            'date': this.timestampToDate(value.date.$date),
            'timestamp': this.timestampToDate(value.timestamp.$date),
            'name': value.name,
            'uptime': value.uptime,
            'description': value.description,
            'ip_address': value.ip_address,
            'is_shared': value.is_shared,
            'online': value.online,
            'status': value.status,
            'active': value.active
          }
          runnerdata.push(runner as Runner);
        });
        this.dataSource = new MatTableDataSource(runnerdata);
        if (!this.changeDetectorRefs['destroyed']) {
          this.changeDetectorRefs.detectChanges();
      }
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

  sortData(event: Event) {
    this.dataSource.sort = this.sort;
  }

  pageData(event?: PageEvent) {
    this.dataSource.paginator = this.paginator;
  }

  private timestampToDate(timestamp) {
    const date = new Date(timestamp);
    const datestring = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
      .toISOString()
      // .split('T')[0];
    // const month = datestring.split('-')[1];
    // const day = datestring.split('-')[2];
    // return [day, month].join('-');
    return datestring
  }

  @Memoize
  getIcon(value) {
    console.log('GET ICON value --> ', value );
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

  showData(data) {
    console.log('showData value ', data);
    return data;
  }

  getDetails(event: Event) {
    console.log('getDetails event ->', event);
    // this.router.navigateByUrl('/details');
  };


  ngOnDestroy() {
    this.clearSubscriptions();
  }

  private clearSubscriptions() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }
}
