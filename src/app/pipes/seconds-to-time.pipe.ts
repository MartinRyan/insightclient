import { Pipe, PipeTransform } from '@angular/core';
import { isUndefined } from 'lodash';

@Pipe({
  name: 'secondsToTime'
})
export class SecondsToTimePipe implements PipeTransform {

  transform(value: number): any {
    if (!isNaN(value)) {
      const hours = Math.floor(value / 3600);
      const minutes = Math.floor((value - (hours * 3600)) / 60);
      const seconds = Math.floor(value - (hours * 3600) - (minutes * 60));

      if (value >= 3600) {
        return ('0' + hours).substr(-2) + ':' + ('0' + minutes).substr(-2) + ':' + ('0' + seconds).substr(-2);
      } else if (value >= 60) {
        return ('0' + minutes).substr(-2) + ':' + ('0' + seconds).substr(-2);
      } else if (value === 0) {
        return ('running');
      } else {
        return('0' + seconds).substr(-2) + ' seconds';
      }
    }
    return;
  }

}
