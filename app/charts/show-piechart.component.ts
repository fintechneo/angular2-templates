import { Component } from '@angular/core';
import { COLORS } from './color-database';
import { Stat } from './stat'
@Component({
  selector: 'show-piechart',
  template: '<piechart [data]="numberstat"></piechart>'
})
export class ShowPiechartComponent {

  numberstat: number[] = [10, 15, 7, 12, 10, 19, 13, 2]

}