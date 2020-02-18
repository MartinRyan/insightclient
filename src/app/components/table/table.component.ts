import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { TableDataSource, TableItem } from './table-datasource';
import { format, subDays } from 'date-fns';
import { RunnersService } from 'src/app/services/gitlab-api/runners.service';
import { RunnersDataSource, RunnerItem } from 'src/app/models/runners-data-source.model';
import { ConditionalExpr } from '@angular/compiler';
import { MatTooltip } from '@angular/material/tooltip';
import { Memoize } from 'lodash-decorators/memoize';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements AfterViewInit, OnInit {
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatTable, { static: false }) table: MatTable<TableItem>;
  dataSource: TableDataSource;
  // dataSource: RunnersDataSource;
  runnerService: RunnersService;
  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  // displayedColumns = ['id', 'name', 'status', 'active', 'description', 'ip_address', 'is_shared', 'online'];
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
  nowminus7: any;
  nowminus6: any;
  nowminus5: any;
  nowminus4: any;
  nowminus3: any;
  nowminus2: any;
  nowminus1: any;
  now: any;

  constructor(private service: RunnersService) {
    this.runnerService = service;
  }

  ngOnInit() {
    this.getDates();
    this.dataSource = new TableDataSource();
    // this.dataSource = new RunnersDataSource(this.runnerService);
    // this.table.dataSource = this.dataSource;
    console.log(this.dataSource);
    // this.runnerService.fetchRunners().subscribe((data) => {
    //   console.log(data);
    // });
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
  }

  @Memoize
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
    console.log('now: ', this.now);
    console.log('nowminus1: ', this.nowminus1);
    console.log('nowminus2: ', this.nowminus2);
    console.log('nowminus3: ', this.nowminus3);
    console.log('nowminus4: ', this.nowminus4);
    console.log('nowminus5: ', this.nowminus5);
    console.log('nowminus6: ', this.nowminus6);
    console.log('nowminus7: ', this.nowminus7);
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
    } else if (value === '') {
      icon = 'warning';
    }
    return icon;
  }
}
