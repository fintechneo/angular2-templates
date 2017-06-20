import {Component} from '@angular/core';

@Component({
  selector: 'my-app',
  template: `
    <md-sidenav-container fullscreen>
      <md-sidenav #sidebar>
        <p style="padding: 10px;">
          <img src="companylogo.png" style="height: 40px; width: auto" alt="companylogo" />
        </p>
        <md-nav-list>
            <a md-list-item routerLink="chart" (click)="sidebar.close()">
                <md-icon md-list-icon>show_chart</md-icon>
                <span md-line>Chart</span>
            </a>            
            <a md-list-item routerLink="table" (click)="sidebar.close()">
                <md-icon md-list-icon>list</md-icon>
                <span md-line>Table</span>
            </a>            
        </md-nav-list>
      </md-sidenav>
      <md-toolbar>
        <button md-icon-button (click)="sidebar.open()">
          <img src="companyicon.png" style="width: 36px; height: 36px" alt="company" />
        </button>

        <span style="margin-left: 20px">Results report</span>
      </md-toolbar>
      <router-outlet></router-outlet>
      
    </md-sidenav-container>`
})
export class AppComponent {

}

