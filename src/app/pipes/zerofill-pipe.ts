import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'zerofill'
})
export class ZerofillPipe implements PipeTransform {

  transform(value: number | string, length: number): unknown {
    if (typeof value === 'number') {
      value = value.toString();
    }
    return value.padStart(length, '0');
  }

}
