import { Component, Input, OnInit } from '@angular/core';
import { COLORS } from '../color-database';
import { Stat } from '../stat'


@Component ({
  moduleId: "app/charts/piechart/",
  selector: 'piechart',
  templateUrl: 'piechart.component.html'
})
export class PiechartComponent implements OnInit {

  @Input() data: Stat[]
  @Input() showLabels: boolean
 
  // Pie slice.
  slices: any[] = [];
  tot = 0
  height  = 400;
  // Compute the (x,y)-coordinate of a percentage beginning from the top.
  private getXYCoord(percent: number): [number, number] {
    return [Math.cos(2 * Math.PI * percent - Math.PI/2) * 150, Math.sin(2 * Math.PI * percent-Math.PI/2) * 150];
  }
  sortByValue(array: any[]) {
    for (let i = 0; i < array.length - 1; i++) {
      if(array[i].value > array[i+1].value){
        let tmp = array[i]
        array[i] = array[i+1]
        array[i+1] = tmp
        array = this.sortByValue(array)
      }
    }
    return array
  }

  ngOnInit(){

  }

  ngOnChanges() {
    this.tot = 0
    if (this.data.length > 0  && this.data != null) {
      for (let i = 0; i < this.data.length; i++) {
         this.tot += this.data[i].count;
       }
      if (this.tot > 0) this.chart();
    }
  }

  chart() {
    
    // create new array to trigger an ngChange
    this.slices = []
    for (let i = 0; i < this.data.length; i++) {
      let count = this.data[i].count;
      let name = this.data[i].name
      this.slices.push(
        {value: count, percent: 0, color: '', cnt: 0, name: name}
      )
    }
    //sorts by value
    this.slices = this.sortByValue(this.slices)
    for(var i in this.slices) {
      this.slices[i].color = COLORS[i]
    }
    //finds percent
    let totalValue = 0
    for (let i = 0; i < this.slices.length; ++i) {
      totalValue += this.slices[i].value
    }
    for (let i = 0; i < this.slices.length; ++i) {
      this.slices[i].percent = this.slices[i].value/totalValue
    }
    // Draw pie slices.
    let cumulativePercent = 0;
    for (let i = 0; i < this.slices.length; ++i) {
      // Compute percentage coordinates.
      const start = this.getXYCoord(cumulativePercent);
      // Each slice starts where the last slice ended, so keep a cumulative percent.
      cumulativePercent += this.slices[i].percent;
      const end = this.getXYCoord(cumulativePercent);
      const mid = this.getXYCoord(cumulativePercent - this.slices[i].percent / 2);
      // If the slice is more than 50%, take the large arc way.
      const largeArcFlag = this.slices[i].percent > .5 ? 1 : 0;
      this.slices[i].data =
        'M ' + start[0] + ' ' + start[1] + ' A 150 150 0 ' + largeArcFlag + ' 1 ' + end[0] + ' ' + end[1] + ' L 0 0';
      this.slices[i].x = mid[0]*0.75;
      this.slices[i].y = mid[1]*0.75;
    }
    for (let i = 0; i < this.slices.length; ++i) {
      this.slices[i].percent = Math.round(this.slices[i].percent*10000)/100
    }
    //cp = cumulativePercent
    let cp = 0
    for (let i = 0; i < this.slices.length; ++i) {
      cp += this.slices[i].percent
      this.slices[i].y2 = this.slices[i].y/(0.6+cp/70)
      this.slices[i].x2 = this.slices[i].x/(0.6+cp/70)
      this.slices[i].yText = this.height/(this.slices.length+1)*(i+1)-0.5*this.height
    }
    // https://hackernoon.com/a-simple-pie-chart-in-svg-dbdd653b6936.
  }
}
