import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { map } from 'rxjs/operators';
import { Observable, of as observableOf, merge } from 'rxjs';
import { format, subDays } from 'date-fns';

// TODO: Replace this with your own data model type
// export interface TableItem {
//   name: string;
//   id: number;
//   active: string;
//   description: string;
//   ip_address: string;
//   is_shared: string;
//   online: string;
//   status: string;
// }

export interface TableItem {
  name: string;
  minus7: object;
  minus6: object;
  minus5: object;
  minus4: object;
  minus3: object;
  minus2: object;
  minus1: object;
  now: object;
}

const RUNNER_DATA: TableItem[] = [
  {
    name: 'one',
    minus7: {
      active: 'true',
      description: 'runner-12a',
      id: 1,
      ip_address: '127.0.0.1',
      is_shared: 'true',
      name: 'seven',
      online: 'true',
      status: 'online'
        },
    minus6: {
      active: 'true',
      description: 'shared-runner-5b',
      id: 6,
      ip_address: '127.0.0.1',
      is_shared: 'true',
      name: 'three',
      online: 'true',
      status: 'online'
        },
    minus5: {
      active: 'true',
      description: 'test-2-78676965',
      id: 85,
      ip_address: '127.0.0.1',
      is_shared: 'false',
      name: 'five',
      online: 'false',
      status: 'offline'
        },
    minus4: {
      active: 'false',
      description: 'shared-runner-7',
      id: 4,
      ip_address: '127.0.0.1',
      is_shared: 'true',
      name: 'one',
      online: 'true',
      status: 'paused'
    },
    minus3: {
      active: 'true',
      description: 'shared-runner-1',
      id: 3,
      ip_address: '127.0.0.1',
      is_shared: 'true',
      name: 'three',
      online: 'true',
      status: 'online'
        },
    minus2: {
      active: 'true',
      description: 'shared-runner-2',
      id: 2,
      ip_address: '127.0.0.1',
      is_shared: 'true',
      name: 'two',
      online: 'false',
      status: 'offline'
      },
    minus1: {
      active: 'true',
      description: 'test-2-20150125',
      id: 1,
      ip_address: '127.0.0.1',
      is_shared: 'false',
      name: 'one',
      online: 'false',
      status: 'offline'
        },
    now: {
      active: 'true',
      description: 'shared-runner-1',
      id: 0,
      ip_address: '127.0.0.1',
      is_shared: 'true',
      name: 'one',
      online: 'true',
      status: 'online'
    }
  }
];

// TODO: replace this with real data from gitlab
// const RUNNER_DATA: TableItem[] = [
//   {
//       active: 'true',
//       description: 'shared-runner-1',
//       id: 1,
//       ip_address: '127.0.0.1',
//       is_shared: 'true',
//       name: 'one',
//       online: 'true',
//       status: 'online'
//   },
//   {
//       active: 'true',
//       description: 'shared-runner-2',
//       id: 3,
//       ip_address: '127.0.0.1',
//       is_shared: 'true',
//       name: 'three',
//       online: 'false',
//       status: 'offline'
//   },
//   {
//       active: 'true',
//       description: 'test-1-20150125',
//       id: 6,
//       ip_address: '127.0.0.1',
//       is_shared: 'false',
//       name: 'six',
//       online: 'true',
//       status: 'paused'
//   },
//   {
//       active: 'true',
//       description: 'test-2-20150125',
//       id: 8,
//       ip_address: '127.0.0.1',
//       is_shared: 'false',
//       name: 'eight',
//       online: 'false',
//       status: 'offline'
//   }
// ];

/**
 * Data source for the Table view. This class should
 * encapsulate all logic for fetching and manipulating the displayed data
 * (including sorting, pagination, and filtering).
 */
export class TableDataSource extends DataSource<TableItem> {
  data: TableItem[] = RUNNER_DATA;
  paginator: MatPaginator;
  sort: MatSort;
  nowminus7: any;
  nowminus6: any;
  nowminus5: any;
  nowminus4: any;
  nowminus3: any;
  nowminus2: any;
  nowminus1: any;
  now: any;

  constructor() {
    super();
  }

  /**
   * Connect this data source to the table. The table will only update when
   * the returned stream emits new items.
   * @returns A stream of the items to be rendered.
   */
  connect(): Observable<TableItem[]> {
    this.getDates();
    // Combine everything that affects the rendered data into one update
    // stream for the data-table to consume.
    const dataMutations = [
      observableOf(this.data),
      this.paginator.page,
      this.sort.sortChange
    ];

    return merge(...dataMutations).pipe(
      map(() => {
        return this.getPagedData(this.getSortedData([...this.data]));
      })
    );
  }

  /**
   *  Called when the table is being destroyed. Use this function, to clean up
   * any open connections or free any held resources that were set up during connect.
   */
  disconnect() {}

  /**
   * Paginate the data (client-side). If you're using server-side pagination,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getPagedData(data: TableItem[]) {
    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    return data.splice(startIndex, this.paginator.pageSize);
  }

  /**
   * Sort the data (client-side). If you're using server-side sorting,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getSortedData(data: TableItem[]) {
    if (!this.sort.active || this.sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      const isAsc = this.sort.direction === 'asc';
      switch (this.sort.active) {
        case 'name':
          return compare(a.name, b.name, isAsc);
        case 'id':
          return compare(+a.id, +b.id, isAsc);
        default:
          return 0;
      }
    });
  }

  getDates() {
    const n = new Date();
    const nowminus7 = format(subDays(n, 7), 'ddMMM');
    const nowminus6 = format(subDays(n, 6), 'ddMMM');
    const nowminus5 = format(subDays(n, 5), 'ddMMM');
    const nowminus4 = format(subDays(n, 4), 'ddMMM');
    const nowminus3 = format(subDays(n, 3), 'ddMMM');
    const nowminus2 = format(subDays(n, 2), 'ddMMM');
    const nowminus1 = format(subDays(n, 1), 'ddMMM');
    const now = format(n, 'ddMMM');
    console.log('now: ', now);
    console.log('nowminus1: ', nowminus1);
    console.log('nowminus2: ', nowminus2);
    console.log('nowminus3: ', nowminus3);
    console.log('nowminus4: ', nowminus4);
    console.log('nowminus5: ', nowminus5);
    console.log('nowminus6: ', nowminus6);
    console.log('nowminus7: ', nowminus7);
  }
}

/** Simple sort comparator for example ID/Name columns (for client-side sorting). */
function compare(a, b, isAsc) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
