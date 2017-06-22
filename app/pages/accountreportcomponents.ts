import {Component,ViewChild} from '@angular/core';
import {SVGLineChartComponent} from '../svgcharts/linechart.component';
import { DataService } from '../data.service';

@Component({    
    selector: 'accountOverview',
    template: `
        <style>
          .flextable {
            display: flex;
            flex-wrap: wrap;
          }
          .flextable div {
            padding: 10px;
            text-align: right;
            width: 70px;
          }
        </style>

        <md-card style="max-height: 100px;">             
        <md-card-content>
            <div class="flextable">
              <div>
                <h3>Start</h3>
                <p>{{linechart.horizNavLeft | date:'MMM yyyy'}}</p>
                <p>{{linechart.firstVisibleValue | number:'1.2-2'}}</p>
              </div>
              <div>
                <h3>End</h3>
                <p>{{linechart.horizNavRight | date:'MMM yyyy'}}</p>
                <p>{{linechart.lastVisibleValue| number:'1.2-2'}}</p>
              </div>                            
              <div>
                <h3>Returns</h3>
                <p style="color: #fff">-</p>
                <p>{{
                  (
                    (linechart.lastVisibleValue/
                    linechart.firstVisibleValue) -1.0
                  )*100 | number:'1.0-2'}} %
                </p>
              </div>
            </div>
        </md-card-content>
      </md-card>
       <md-card>
        <md-card-header>
            <md-icon md-card-avatar>chart</md-icon>
            <md-card-title><span style="color: #fff">Chart</span></md-card-title>
            <md-card-subtitle>Equity</md-card-subtitle>
        </md-card-header>        
        <md-card-content>
          <div style="width: 100%; height: 265px">
            <svg-linechart #linechart [xaxisnav]="true" [datapoints]="dataservice.datapoints" mode="standard">
            </svg-linechart>
          </div>
        </md-card-content>        
      </md-card>
    `
})
export class AccountOverviewComponent {
  @ViewChild("linechart") linechart : SVGLineChartComponent;
  
  constructor(public dataservice : DataService) {
  
  }
  
}
