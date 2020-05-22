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
import { Runner } from './../../../models/runner';
import { RunnersDataSource } from './../../../models/runners-data-source.model';
import { InsightService } from './../../../services/insight-api/insight.service';
import { NotificationService } from './../../../services/notification/notification.service';
import { SettingsService } from './../../../services/settings/settings.service';
import { PageSettingsModel } from '@syncfusion/ej2-angular-grids';
import { DataStateChangeEventArgs } from '@syncfusion/ej2-angular-grids';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-matrix-grid',
  templateUrl: './matrix-grid.component.html',
  styleUrls: ['./matrix-grid.component.styl']
})
export class MatrixGridComponent implements OnInit {
  dataSource: RunnersDataSource;
  insightService: InsightService;
  settingsService: SettingsService;

  nowminus6: any;
  nowminus5: any;
  nowminus4: any;
  nowminus3: any;
  nowminus2: any;
  nowminus1: any;
  nowminus0: any;
  now: any;

  isLoading = false;
  public matrixdata;

  // public matrixdata: Observable<DataStateChangeEventArgs>;
  public pageSettings: PageSettingsModel;

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
    this.pageSettings = { pageSize: 6 };
    this.dataSource = new RunnersDataSource();
    // const ndays = Number(this.settingsService.settings.timeRangeRunners);
    const ndays = 7 // for testing
    this.fetchMatrix(ndays);
    this.zone.runOutsideAngular(() => {
      setInterval(() => {
        this.clearSubscriptions();
        this.fetchMatrix(ndays);
      }, this.updateInterval);
    });
  }

  private fetchMatrix(ndays: number): any {
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

    this.insightService.fetchInsightData(ndays, 'matrix').subscribe(
      matrix => {
        if(!isEmpty(matrix)) {
        each(matrix, (value, key) => {
          // console.log('matrix: ', matrix);
          // console.log('');
          // console.log('matrix: ', JSON.stringify(matrix));
          // console.log('');
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
        // sorted_runners = this.groupby(allrunners, 'name');
        console.log('sorted_runners ]-> \n', allrunners);
        console.log('sorted_runners ]-> \n', JSON.stringify(allrunners));
        // for (let i = 0; i < nrunners; i++) {
        //   each(sorted_runners, (prop, obj) => {
        //     // i++
        //     const runner = keyBy(prop, 'column');
        //     runnergroup = {
        //       'id': i,
        //       'name': obj,
        //       runner
        //     }
        //     console.log('runnergroup ]-> \n', runnergroup);
        //     console.log('runnergroup ]-> \n', JSON.stringify(runnergroup));
        //     matrixdata.push(runnergroup);
        //   })
        // }
        // for (const run of runners) {
        //   each(sorted_runners, (value, key) => {
        //   // const runner = keyBy(prop, 'name');
        //   // const runner = this.transformData(prop);
        //   const obj = {};
        //   obj[key] = value;
        //   matrixdata.push(obj);
        //  });
        // }

        this.matrixdata = this.getTestData();
        // const output = sorted_runners.map(a => Object.fromEntries(a));
        // console.log('matrixdata ]-> \n', matrixdata);
        // console.log('matrixdata ]-> \n', JSON.stringify(matrixdata));
        // this.matrixdata = matrixdata;
        // this.table.dataSource = matrixdata;
        // this.dataSource = allrunners;
        // this.matrixdata = sorted_runners;
        // this.matrixdata = matrixdata;
      }
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

// transformData(array) {
//     return array.map(object => Object.assign(...object.map(([k, v]) => ({ [k]: v }))));
// }

getTestData() {
  const data: Object[] = [
    {
        OrderID: 10248, CustomerID: 'VINET', EmployeeID: 5, OrderDate: new Date(8364186e5),
        ShipName: 'Vins et alcools Chevalier', ShipCity: 'Reims', ShipAddress: '59 rue de l Abbaye',
        ShipRegion: 'CJ', ShipPostalCode: '51100', ShipCountry: 'France', Freight: 32.38, Verified: !0
    },
    {
        OrderID: 10249, CustomerID: 'TOMSP', EmployeeID: 6, OrderDate: new Date(836505e6),
        ShipName: 'Toms Spezialitäten', ShipCity: 'Münster', ShipAddress: 'Luisenstr. 48',
        ShipRegion: 'CJ', ShipPostalCode: '44087', ShipCountry: 'Germany', Freight: 11.61, Verified: !1
    },
    {
        OrderID: 10250, CustomerID: 'HANAR', EmployeeID: 4, OrderDate: new Date(8367642e5),
        ShipName: 'Hanari Carnes', ShipCity: 'Rio de Janeiro', ShipAddress: 'Rua do Paço, 67',
        ShipRegion: 'RJ', ShipPostalCode: '05454-876', ShipCountry: 'Brazil', Freight: 65.83, Verified: !0
    },
    {
        OrderID: 10251, CustomerID: 'VICTE', EmployeeID: 3, OrderDate: new Date(8367642e5),
        ShipName: 'Victuailles en stock', ShipCity: 'Lyon', ShipAddress: '2, rue du Commerce',
        ShipRegion: 'CJ', ShipPostalCode: '69004', ShipCountry: 'France', Freight: 41.34, Verified: !0
    },
    {
        OrderID: 10252, CustomerID: 'SUPRD', EmployeeID: 4, OrderDate: new Date(8368506e5),
        ShipName: 'Suprêmes délices', ShipCity: 'Charleroi', ShipAddress: 'Boulevard Tirou, 255',
        ShipRegion: 'CJ', ShipPostalCode: 'B-6000', ShipCountry: 'Belgium', Freight: 51.3, Verified: !0
    },
    {
        OrderID: 10253, CustomerID: 'HANAR', EmployeeID: 3, OrderDate: new Date(836937e6),
        ShipName: 'Hanari Carnes', ShipCity: 'Rio de Janeiro', ShipAddress: 'Rua do Paço, 67',
        ShipRegion: 'RJ', ShipPostalCode: '05454-876', ShipCountry: 'Brazil', Freight: 58.17, Verified: !0
    },
    {
        OrderID: 10254, CustomerID: 'CHOPS', EmployeeID: 5, OrderDate: new Date(8370234e5),
        ShipName: 'Chop-suey Chinese', ShipCity: 'Bern', ShipAddress: 'Hauptstr. 31',
        ShipRegion: 'CJ', ShipPostalCode: '3012', ShipCountry: 'Switzerland', Freight: 22.98, Verified: !1
    },
    {
        OrderID: 10255, CustomerID: 'RICSU', EmployeeID: 9, OrderDate: new Date(8371098e5),
        ShipName: 'Richter Supermarkt', ShipCity: 'Genève', ShipAddress: 'Starenweg 5',
        ShipRegion: 'CJ', ShipPostalCode: '1204', ShipCountry: 'Switzerland', Freight: 148.33, Verified: !0
    },
    {
        OrderID: 10256, CustomerID: 'WELLI', EmployeeID: 3, OrderDate: new Date(837369e6),
        ShipName: 'Wellington Importadora', ShipCity: 'Resende', ShipAddress: 'Rua do Mercado, 12',
        ShipRegion: 'SP', ShipPostalCode: '08737-363', ShipCountry: 'Brazil', Freight: 13.97, Verified: !1
    },
    {
        OrderID: 10257, CustomerID: 'HILAA', EmployeeID: 4, OrderDate: new Date(8374554e5),
        ShipName: 'HILARION-Abastos', ShipCity: 'San Cristóbal', ShipAddress: 'Carrera 22 con Ave. Carlos Soublette #8-35',
        ShipRegion: 'Táchira', ShipPostalCode: '5022', ShipCountry: 'Venezuela', Freight: 81.91, Verified: !0
    },
    {
        OrderID: 10258, CustomerID: 'ERNSH', EmployeeID: 1, OrderDate: new Date(8375418e5),
        ShipName: 'Ernst Handel', ShipCity: 'Graz', ShipAddress: 'Kirchgasse 6',
        ShipRegion: 'CJ', ShipPostalCode: '8010', ShipCountry: 'Austria', Freight: 140.51, Verified: !0
    },
    {
        OrderID: 10259, CustomerID: 'CENTC', EmployeeID: 4, OrderDate: new Date(8376282e5),
        ShipName: 'Centro comercial Moctezuma', ShipCity: 'México D.F.', ShipAddress: 'Sierras de Granada 9993',
        ShipRegion: 'CJ', ShipPostalCode: '05022', ShipCountry: 'Mexico', Freight: 3.25, Verified: !1
    },
    {
        OrderID: 10260, CustomerID: 'OTTIK', EmployeeID: 4, OrderDate: new Date(8377146e5),
        ShipName: 'Ottilies Käseladen', ShipCity: 'Köln', ShipAddress: 'Mehrheimerstr. 369',
        ShipRegion: 'CJ', ShipPostalCode: '50739', ShipCountry: 'Germany', Freight: 55.09, Verified: !0
    },
    {
        OrderID: 10261, CustomerID: 'QUEDE', EmployeeID: 4, OrderDate: new Date(8377146e5),
        ShipName: 'Que Delícia', ShipCity: 'Rio de Janeiro', ShipAddress: 'Rua da Panificadora, 12',
        ShipRegion: 'RJ', ShipPostalCode: '02389-673', ShipCountry: 'Brazil', Freight: 3.05, Verified: !1
    },
    {
        OrderID: 10262, CustomerID: 'RATTC', EmployeeID: 8, OrderDate: new Date(8379738e5),
        ShipName: 'Rattlesnake Canyon Grocery', ShipCity: 'Albuquerque', ShipAddress: '2817 Milton Dr.',
        ShipRegion: 'NM', ShipPostalCode: '87110', ShipCountry: 'USA', Freight: 48.29, Verified: !0
    }];
  return data;
}

  groupby = (array, key) => {
    return array.reduce((result, currentValue) => {
      (result[currentValue[key]] = result[currentValue[key]] || []).push(
        currentValue
      );
      return result;
    }, {});
  };

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
