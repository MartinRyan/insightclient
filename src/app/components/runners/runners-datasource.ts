import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { map } from 'rxjs/operators';
import { Observable, of as observableOf, merge } from 'rxjs';
import { format, subDays, isBefore } from 'date-fns';
import {Runner} from './../../models/runner';

export interface TableItem {
  id: string;
  name: string;
  // minus7: object;
  minus6: object;
  minus5: object;
  minus4: object;
  minus3: object;
  minus2: object;
  minus1: object;
  now: object;
}


/**
 * Data source for the Table view. This class should
 * encapsulate all logic for fetching and manipulating the displayed data
 * (including sorting, pagination, and filtering).
 */
export class RunnersDataSource extends DataSource<Runner> {
  data: Runner[] = [];
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
  connect(): Observable<Runner[]> {
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
  private getPagedData(data: Runner[]) {
    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    return data.splice(startIndex, this.paginator.pageSize);
  }

  /**
   * Sort the data (client-side). If you're using server-side sorting,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getSortedData(data: Runner[]) {
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
    // const nowminus7 = format(subDays(n, 7), 'ddMMM');
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
