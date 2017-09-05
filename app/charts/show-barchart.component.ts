import { Component } from '@angular/core';
import { COLORS } from './color-database';
import { Stat } from './stat'
@Component({
  moduleId: "app/charts/",
  selector: 'show-barchart',
  templateUrl: 'show-barchart.component.html'
})
export class ShowBarchartComponent {
  statistics: Stat[] = [
    { name: "One", count: 309 },
    { name: "Two", count: 302 },
    { name: "Three", count: 301 },
    { name: "Four", count: 302 },
    { name: "Five", count: 305 },
    { name: "Six", count: 491 },
    { name: "Seven", count: 302 },
    { name: "Eight", count: 310 }
  ]
  stat: any[] = [
    {
      label: "English", stat: [
        { name: "One", value: 300 },
        { name: "Two", value: 2 },
        { name: "Three", value: 3 },
        { name: "Four", value: 8 },
        { name: "Five", value: 5 },
        { name: "Six", value: 4 },
        { name: "Seven", value: 3.5 },
        { name: "Eight", value: 16 }
      ]
    },
    {
      label: "Español", stat: [
        { name: "Uno", value: 3 },
        { name: "Dos", value: 2 },
        { name: "Tres", value: 1 },
        { name: "Quatro", value: 22 },
        { name: "Cinco", value: 5 },
        { name: "Seis", value: 11 },
        { name: "Siete", value: 2 },
        { name: "Ocho", value: 3.7 }
      ]
    },
    {
      label: "Norsk", stat: [
        { name: "En", value: 23 },
        { name: "To", value: 13 },
        { name: "Tre", value: 6 },
        { name: "Fire", value: 23 }
      ]
    },
    {
      label: "Svenska", stat: [
        { name: "En", value: 23 },
        { name: "Två", value: 13 },
        { name: "Tre", value: 6 },
        { name: "Fyra", value: 20 }
      ]
    }
  ]
}
