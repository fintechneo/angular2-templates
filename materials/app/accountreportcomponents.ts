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
           <svg viewBox="0 0 600 600" height="100%" width="100%" preserveAspectRatio="none">                
              <g class="grid x-grid" id="xGrid">
                <line x1="90" x2="90" y1="5" y2="371"></line>
              </g>
              <g class="grid y-grid" id="yGrid">
                <line x1="90" x2="705" y1="370" y2="370"></line>
              </g>
                <g class="labels x-labels">
                <text x="100" y="400">2008</text>
                <text x="246" y="400">2009</text>
                <text x="392" y="400">2010</text>
                <text x="538" y="400">2011</text>
                <text x="684" y="400">2012</text>
                <text x="400" y="440" class="label-title">Year</text>
              </g>
              <g class="labels y-labels">
                <text x="80" y="15">15</text>
                <text x="80" y="131">10</text>
                <text x="80" y="248">5</text>
                <text x="80" y="373">0</text>
                <text x="50" y="200" class="label-title">Price</text>
              </g>
              <g class="data" data-setname="Our first data set">
                <template ngFor let-p [ngForOf]="datapoints" let-i="index">
                  <circle [attr.cx]="p[0]" [attr.cy]="p[1]" [attr.data-value]="p[1]" r="4"></circle>
                  <line *ngIf="i>0" 
                    [attr.x1]="datapoints[i-1][0]" 
                    [attr.y1]="datapoints[i-1][1]"
                    [attr.x2]="p[0]"  
                    [attr.y2]="p[1]" 
                    fill="none"
                    stroke="#0074d9"
                    stroke-width="3"></line>
                 </template>
              </g>
            </svg>
        </md-card-content>
        <table>
        <tr *ngFor="let p of datapoints">
          <td>
            <input type="number" [(ngModel)]="p[0]" />
          </td>
          <td>
            <input type="number" [(ngModel)]="p[1]" />
          </td>
        </tr>
        </table>
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
