import { Component, NgZone, OnInit, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { SvgIconRegistryService } from 'angular-svg-icon';
import { each, isEmpty } from 'lodash';
import { Memoize } from 'lodash-decorators/memoize';
import { NgxSpinnerService } from 'ngx-spinner';
import { Runner } from './../../../models/runner';
import { InsightService } from './../../../services/insight-api/insight.service';
import { SettingsService } from './../../../services/settings/settings.service';
import { Subscription, timer } from 'rxjs';
import { startWith } from 'rxjs/operators';

@Component({
  selector: 'app-matrix',
  templateUrl: './matrix.component.html',
  styleUrls: ['./matrix.component.styl']
})
export class MatrixComponent implements OnInit, AfterViewInit {
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
  public pageLength: number;
  pageEvent: PageEvent;
  subscription: Subscription;
  iservice: InsightService;
  sservice: SettingsService;


  constructor(
    private insightService: InsightService,
    private settingsService: SettingsService,
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
    this.iservice = insightService;
    this.sservice = settingsService;
  }

  ngOnInit() {
    this.startPolling();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  private fetchData(ndays: number) {
    this.isLoading = true;
    this.spinner.show();
    let runnerdata = [];
    let index = 0;
    if (!isEmpty(this.iservice) && !isEmpty(this.subscription)) {
      this.iservice.fetchInsightData(ndays, 'today').subscribe(
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
  }

  startPolling() {
    this.subscription = timer(0, this.updateInterval).subscribe(val => this.fetchData(this.ndays));
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  sortData(event: Event) {
    this.dataSource.sort = this.sort;
  }

  onPaginateChange(event?: PageEvent) {
    this.pageLength = this.matrixdata.length;
    this.dataSource.paginator = this.paginator;
    if (!this.changeDetectorRefs['destroyed']) {
      this.changeDetectorRefs.detectChanges();
    };
  }

  private timestampToDate(timestamp) {
    const date = new Date(timestamp);
    const datestring = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
      .toISOString()
    return datestring
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
    return data;
  }

  getDetails(event: Event) {
    // this.router.navigateByUrl('/details');
  };

  ngOnDestroy() {
    if (!isEmpty(this.subscription)) {
      this.subscription.unsubscribe()
    }
  }
}
