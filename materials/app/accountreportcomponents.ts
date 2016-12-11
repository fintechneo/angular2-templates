import {Component} from '@angular/core';

@Component({    
    selector: 'accountOverview',
    styleUrls: ["app/accountreportcomponents.css"],
    template: `
        <md-card>
        <md-card-header>
            <md-icon md-card-avatar>report</md-icon>
            <md-card-title>Account overview</md-card-title>
            <md-card-subtitle>December 2016</md-card-subtitle>
        </md-card-header>        
        <md-card-content>
            <div class="flextable">
              <div>
                <h3>Account no</h3>
                5588332AXT
              </div>
              <div>
                <h3>Ingoing value</h3>
                48000
              </div>
              <div>
                <h3>Outgoing value</h3>
                55000
              </div>
              <div>
                <h3>Cash</h3>
                3000
              </div>
            </div>
        </md-card-content>
      </md-card>
    `
})
export class AccountOverviewComponent {

}

@Component({    
    selector: 'accountChart',
    styleUrls: ["app/accountreportcomponents.css"],
    template: `
      <md-card>
        <md-card-header>
            <md-icon md-card-avatar>chart</md-icon>
            <md-card-title>Chart</md-card-title>
            <md-card-subtitle>Returns</md-card-subtitle>
        </md-card-header>        
        <md-card-content>
           <svg-linechart [datapoints]="datapoints" ></svg-linechart>
        </md-card-content>        
      </md-card>
    `
})
export class AccountChartComponent {
  datapoints : any = [
    [90,200],
    [240,300],
    [388,200],
    [531,165],
    [677,100]
  ];
}
