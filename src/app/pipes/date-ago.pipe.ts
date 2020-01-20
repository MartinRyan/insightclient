import { Pipe, PipeTransform } from '@angular/core';
import { isUndefined } from 'lodash';

@Pipe({
  name: 'dateAgo',
  pure: true
})
export class DateAgoPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    if (value) {
      const seconds = Math.floor((+new Date() - +new Date(value)) / 1000);
      const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
        second: 1
      };
      if (seconds < 29) {
        return 'Just now';
      }
      let counter: number;
      for (const i in intervals) {
        if (!isUndefined(seconds)) {
          counter = Math.floor(seconds / intervals[i]);
          if (counter > 0) {
            if (counter === 1) {
              return counter + ' ' + i + ' ago';
            } else {
              return counter + ' ' + i + 's ago';
            }
          }
        }
      }
    }
    return value;
  }

}
