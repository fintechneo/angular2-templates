import { Component } from '@angular/core';
import { COLORS } from './color-database';
import { Stat } from './stat'
@Component({
  selector: 'show-piechart',
  template: `
    <piechart [data]="statistics" [showLabels] = "true"></piechart>
    <piechart [data]="statistics2" [showLabels] = "false"></piechart>
  `
})
export class ShowPiechartComponent {

  numberstat: number[] = [10, 15, 7, 12, 10, 19, 13, 2]
  statistics: Stat[] = [
    { name: "One", count: 1 },
    { name: "Two", count: 2 },
    { name: "Three", count: 3 },
    { name: "Four", count: 4 },
    { name: "Five", count: 5 },
    { name: "Six", count: 6 },
    { name: "Seven", count: 7 },
    { name: "Eight", count: 8 }
  ]
    statistics2: Stat[] = [
    { name: "One", count: 5 },
    { name: "Two", count: 9 },
    { name: "Three", count: 3 },
    { name: "Four", count: 4 },
    { name: "Five", count: 50 },
    { name: "Six", count: 6 },
    { name: "Seven", count: 7 },
    { name: "Eight", count: 8 }
  ]
}