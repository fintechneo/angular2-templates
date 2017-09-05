import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { Stat } from '../stat'
import { COLORS } from '../color-database';

@Component({
  moduleId: "app/charts/horizontal-barchart/",
  selector: 'horizontal-barchart',
  templateUrl: 'horizontal-barchart.component.html',
  styleUrls: ['horizontal-barchart.component.css']
})
export class HorizontalBarchartComponent implements OnChanges {
  //attributes
  @Input() data: Stat[]
  @Input() inputheight: String;
  logOfBV: number
  lineHeight: any[] = []
  yAxisPos = 135
  xAxisPos = 31
  biggestValue = 0
  step: number
  height = 400
  width = 535
  tot = 0
  rectangles: any[] = [];
  fontSize : number
  numberOfLines: number = 0;
  //methods
  getX(i: number) {
    return this.xAxisPos+this.step*(7*i+1.1)
  }

  sortByValue(array: any[]) {
    for (let i = 0; i < array.length - 1; i++) {
      if(array[i].value < array[i+1].value){
        let tmp = array[i]
        array[i] = array[i+1]
        array[i+1] = tmp
        array = this.sortByValue(array)
      }
    }
    return array
  }

  line(array: any[], log: number){
    for (let i = 1; i <= Math.round(this.biggestValue)/(10**log); i++) {
      if(i!=10) {
        let name = i*10**log
        let nr = (this.width-this.yAxisPos)*(name/(1.1*this.biggestValue))+this.yAxisPos
        if(log === -1) {
          name = Math.round(name*10)/10
        }
        array.push({nr: nr, name: name})
      }
    }
    if (array.length < 2) {
      array = this.line2(array, log - 1)
    } else if (array.length < 4) {
      array = this.line50(array, log)
    }

    return array
  }
  line2(array: any[], log: number) {
    for (let i = 2; i <= this.biggestValue / (10 ** log); i += 2) {
      if (i != 10) {
        let name = i*10**log
        let nr = (this.width - this.yAxisPos) * (name / (1.1 * this.biggestValue)) + this.yAxisPos
        name = Math.round(10*name)/10
        array.push({ nr: nr, name: name })
      }
    }
    return array
  }
  line50(array: any[], log: number){
    for (let i = 0.5; i <= this.biggestValue/(10**log); i++) {
      let name = i*10**log
      let nr = (this.width-this.yAxisPos)*(name/(1.1*this.biggestValue))+this.yAxisPos
      name = Math.round(name*10)/10
      array.push({nr: nr, name: name})
    }
    return array
  }


  constructor() {
    //this.xAxisPos = this.height - this.xAxisPos
  }


  ngOnChanges() {   
    this.tot = 0  
    if (this.data && this.data.length > 0) {
      for (let i = 0; i < this.data.length; i++) {
         this.tot += this.data[i].count;
       }
      if (this.tot > 0) this.chart();
    }
  }

  chart() {
    
      
      if(this.data.length > 20) {
        this.fontSize = 10;
      } else {
        this.fontSize = 15;
      }
      this.rectangles = []
      this.lineHeight = []
    for (let i = 0; i < this.data.length; i++) {
      let name = this.data[i].name
      let count = this.data[i].count
      let color = COLORS[i]
      this.rectangles.push(
        {name: name, value: count, color: color, x1: 0, x2: 0, y1: 0, usedValue: 0}
      )
    }

    this.step = (this.height-this.xAxisPos)/(7*this.rectangles.length)
    //Finds biggestValue
    this.biggestValue =0
    for (let i = 0; i < this.rectangles.length; i++) {
      if(this.rectangles[i].value > this.biggestValue){
        this.biggestValue = this.rectangles[i].value
      }
    }
    let log = Math.log10(this.biggestValue)
    this.logOfBV = Math.round(log)
        if(this.biggestValue/10**this.logOfBV < 1 ) {
      this.logOfBV--
    }
    let mod = this.biggestValue%(10**this.logOfBV)
    if(mod/(10**(this.logOfBV-1))>6.5){
      this.biggestValue = Math.round(this.biggestValue/(10**this.logOfBV))*(10**this.logOfBV)
    } else if (mod/(10**(this.logOfBV-1))<5 && mod/(10**(this.logOfBV-1)) > 1.5) {
      this.biggestValue += 5*(10**(this.logOfBV-1))-mod
    }
    this.lineHeight = this.line(this.lineHeight, this.logOfBV)
    this.biggestValue = 1.1*this.biggestValue
    for (let j = 0; j < this.rectangles.length; j++) {
      this.rectangles[j].x1 = this.getX(j);
      let mltplr = 3;
      if(this.fontSize === 10) {mltplr  = 5;}
      this.rectangles[j].x2 = this.rectangles[j].x1 + this.step*mltplr;
      this.rectangles[j].usedValue = this.rectangles[j].value*(this.width-this.yAxisPos)/this.biggestValue
      this.rectangles[j].y1 = this.xAxisPos-this.rectangles[j].usedValue
    }
    this.numberOfLines = this.lineHeight.length
  }
}
