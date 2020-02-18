import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { map } from 'rxjs/operators';
import { Observable, of as observableOf, merge } from 'rxjs';
import { format, subDays, isBefore } from 'date-fns';

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
  id: string;
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
    id: '1',
    name: 'shared-runner-1',
    minus7: {
      active: 'true',
      description: 'test03-447589',
      id: 1,
      ip_address: '127.0.0.1',
      is_shared: 'true',
      name: 'shared-runner-1',
      online: 'true',
      status: 'active'
    },
    minus6: {
      active: 'true',
      description: 'test-16781-67',
      id: 6,
      ip_address: '127.0.0.1',
      is_shared: 'true',
      name: 'shared-runner-1',
      online: 'true',
      status: 'active'
    },
    minus5: {
      active: 'false',
      description: 'test-11-142463576',
      id: 85,
      ip_address: '127.0.0.1',
      is_shared: 'false',
      name: 'shared-runner-1',
      online: 'false',
      status: 'offline'
    },
    minus4: {
      active: 'true',
      description: 'test-1-3453453',
      id: 4,
      ip_address: '127.0.0.1',
      is_shared: 'true',
      name: 'shared-runner-1',
      online: 'true',
      status: 'active'
    },
    minus3: {
      active: 'true',
      description: 'test-3-874857',
      id: 3,
      ip_address: '127.0.0.1',
      is_shared: 'true',
      name: 'shared-runner-1',
      online: 'true',
      status: 'active'
    },
    minus2: {
      active: 'false',
      description: 'test-4-20154',
      id: 2,
      ip_address: '127.0.0.1',
      is_shared: 'true',
      name: 'shared-runner-1',
      online: 'false',
      status: 'offline'
    },
    minus1: {
      active: 'false',
      description: 'test-5-20150125',
      id: 1,
      ip_address: '127.0.0.1',
      is_shared: 'false',
      name: 'shared-runner-1',
      online: 'false',
      status: 'offline'
    },
    now: {
      active: 'false',
      description: 'test-6-383487',
      id: 0,
      ip_address: '127.0.0.1',
      is_shared: 'true',
      name: 'shared-runner-1',
      online: 'true',
      status: 'paused'
    }
  },
  {
    id: '2',
    name: 'shared-runner-2',
    minus7: {
      active: 'false',
      description: 'test71-34347',
      id: 1,
      ip_address: '127.0.0.1',
      is_shared: 'true',
      name: 'shared-runner-2',
      online: 'true',
      status: 'paused'
    },
    minus6: {
      active: 'true',
      description: 'test-218-878',
      id: 2,
      ip_address: '127.0.0.1',
      is_shared: 'true',
      name: 'shared-runner-2',
      online: 'true',
      status: 'active'
    },
    minus5: {
      active: 'false',
      description: 'test-43-5457',
      id: 3,
      ip_address: '127.0.0.1',
      is_shared: 'false',
      name: 'shared-runner-2',
      online: 'true',
      status: 'online'
    },
    minus4: {
      active: 'true',
      description: 'test-1-3453453',
      id: 4,
      ip_address: '127.0.0.1',
      is_shared: 'true',
      name: 'shared-runner-2',
      online: 'true',
      status: 'active'
    },
    minus3: {
      active: 'true',
      description: 'test-2-44567',
      id: 5,
      ip_address: '127.0.0.1',
      is_shared: 'true',
      name: 'shared-runner-2',
      online: 'true',
      status: 'active'
    },
    minus2: {
      active: 'true',
      description: 'test-4-20154',
      id: 2,
      ip_address: '127.0.0.1',
      is_shared: 'true',
      name: 'shared-runner-2',
      online: 'true',
      status: 'active'
    },
    minus1: {
      active: 'true',
      description: 'test-5-20150125',
      id: 1,
      ip_address: '127.0.0.1',
      is_shared: 'true',
      name: 'shared-runner-2',
      online: 'true',
      status: 'active'
    },
    now: {
      active: 'true',
      description: 'test-6-383487',
      id: 0,
      ip_address: '127.0.0.1',
      is_shared: 'true',
      name: 'shared-runner-2',
      online: 'true',
      status: 'active'
    }
  },
  {
    id: '3',
    name: 'runner-1',
    minus7: {
      active: 'true',
      description: 'run-8484-36',
      id: 1,
      ip_address: '127.0.0.1',
      is_shared: 'false',
      name: 'runner-1',
      online: 'true',
      status: 'active'
    },
    minus6: {
      active: '',
      description: '',
      id: null,
      ip_address: '',
      is_shared: '',
      name: '',
      online: '',
      status: ''
    },
    minus5: {
      active: 'true',
      description: 'run-987123',
      id: 3,
      ip_address: '127.0.0.1',
      is_shared: 'false',
      name: 'runner-1',
      online: 'true',
      status: 'active'
    },
    minus4: {
      active: 'true',
      description: 'run-43-575',
      id: 4,
      ip_address: '127.0.0.1',
      is_shared: 'false',
      name: 'runner-1',
      online: 'true',
      status: 'active'
    },
    minus3: {
      active: 'false',
      description: 'run-435-987',
      id: 5,
      ip_address: '127.0.0.1',
      is_shared: 'false',
      name: 'runner-1',
      online: 'true',
      status: 'online'
    },
    minus2: {
      active: 'true',
      description: 'run-897-1',
      id: 2,
      ip_address: '127.0.0.1',
      is_shared: 'false',
      name: 'runner-1',
      online: 'true',
      status: 'active'
    },
    minus1: {
      active: 'true',
      description: 'run-567-098',
      id: 1,
      ip_address: '127.0.0.1',
      is_shared: 'false',
      name: 'runner-1',
      online: 'true',
      status: 'active'
    },
    now: {
      active: 'true',
      description: 'run-6-747',
      id: 0,
      ip_address: '127.0.0.1',
      is_shared: 'false',
      name: 'runner-1',
      online: 'true',
      status: 'active'
    }
  },
  {
    id: '4',
    name: 'runner-2a',
    minus7: {
      active: 'true',
      description: 'run-926629',
      id: 1,
      ip_address: '127.0.0.1',
      is_shared: 'false',
      name: 'runner-2a',
      online: 'true',
      status: 'active'
    },
    minus6: {
      active: 'true',
      description: 'run-04783-76',
      id: 2,
      ip_address: '127.0.0.1',
      is_shared: 'false',
      name: 'runner-2a',
      online: 'true',
      status: 'active'
    },
    minus5: {
      active: 'true',
      description: 'run-1274-09',
      id: 3,
      ip_address: '127.0.0.1',
      is_shared: 'false',
      name: 'runner-2a',
      online: 'true',
      status: 'active'
    },
    minus4: {
      active: 'false',
      description: 'run-1104573',
      id: 4,
      ip_address: '127.0.0.1',
      is_shared: 'false',
      name: 'runner-2a',
      online: 'true',
      status: 'paused'
    },
    minus3: {
      active: 'true',
      description: 'run-99914',
      id: 5,
      ip_address: '127.0.0.1',
      is_shared: 'false',
      name: 'runner-2a',
      online: 'true',
      status: 'active'
    },
    minus2: {
      active: 'true',
      description: 'run-12a-3989',
      id: 2,
      ip_address: '127.0.0.1',
      is_shared: 'false',
      name: 'runner-2a',
      online: 'true',
      status: 'active'
    },
    minus1: {
      active: 'true',
      description: 'run-1237',
      id: 1,
      ip_address: '127.0.0.1',
      is_shared: 'false',
      name: 'runner-2a',
      online: 'true',
      status: 'active'
    },
    now: {
      active: 'false',
      description: 'run-88645',
      id: 0,
      ip_address: '127.0.0.1',
      is_shared: 'false',
      name: 'runner-2a',
      online: 'false',
      status: 'offline'
    }
  }
];

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
  }
}

/** Simple sort comparator for example ID/Name columns (for client-side sorting). */
function compare(a, b, isAsc) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
