import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'largenumber'})
export class LargeNumberPipe implements PipeTransform {
  transform(num: number, args: string[]): any {
    let neg = num<0;
    if(neg) {
      num = Math.abs(num);
    }
    if (!num) return num;

     var si = [
        { value: 1E18, symbol: "E" },
        { value: 1E15, symbol: "P" },
        { value: 1E12, symbol: "T" },
        { value: 1E9,  symbol: "G" },
        { value: 1E6,  symbol: "M" },
        { value: 1E3,  symbol: "k" }
    ], rx = /\.0+$|(\.[0-9]*[1-9])0+$/, i;

    for (i = 0; i < si.length; i++) {
        if (num >= si[i].value) {
        return (neg ? "-" : "")+(num / si[i].value).toFixed(0).replace(rx, "$1") + si[i].symbol;
        }
    }
    return (neg ? "-" : "")+num.toFixed(0).replace(rx, "$1");
    
  }
}