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
import { SettingsService } from './../../../services/settings/settings.service';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.styl']
})
export class GridComponent implements OnInit {
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
  ndays: number; // this is number of days per runner
  public pageLength: number;
  pageEvent: PageEvent;

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
      'date',
      'description',
      'uptime',
      'ip_address',
      'is_shared',
      'online',
    ];
  }

  ngOnInit() {
    Number(this.settingsService.settings.numberOfDaysGrid) > 0 ?
    // this is number of days per runner
    this.ndays = Number(this.settingsService.settings.numberOfDaysGrid) : this.ndays = 5;
    this.fetchData(this.ndays);
    this.zone.runOutsideAngular(() => {
      setInterval(() => {
        this.clearSubscriptions();
        this.fetchData(this.ndays);
      }, this.updateInterval);
    });
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  private fetchData(ndays: number): any {
    let runners: any = [];
    let runnerobj: any = {};
    let allrunners: any = [];

    this.insightService.fetchInsightData(ndays, 'grid').subscribe(
      matrix => {
        each(matrix, (value, key) => {
          let datestring;
          let index = 0;
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
            each(r, (value, key) => {
              index++
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
            this.pageLength = allrunners.length;
          }
        });
        this.matrixdata = allrunners;
        console.log('this.matrixdata ]]: ', this.matrixdata );
        this.dataSource = new MatTableDataSource(this.matrixdata);
        if (!this.changeDetectorRefs['destroyed']) {
          this.changeDetectorRefs.detectChanges();
        };
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

  onPaginateChange(event?: PageEvent) {
    console.log('paginate event: ', event);
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