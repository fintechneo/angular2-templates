import {Component} from '@angular/core';

@Component({
  selector: 'my-app',
  template: `
    <md-sidenav-layout fullscreen>
      <md-sidenav #sidebar>
        <p style="padding-top: 10px; padding-left: 20px">
          <img src="companylogo.png" style="height: 40px; width: auto" alt="companylogo" />
        </p>
        <md-nav-list>
            <a md-list-item (click)="sidebar.close()">
                <md-icon md-list-icon>assignment</md-icon>
                <span md-line>Month report</span>
            </a>
            <a md-list-item (click)="sidebar.close()">
                <md-icon md-list-icon>assignment</md-icon>
                <span md-line>Annual report</span>
            </a>
             <a md-list-item (click)="sidebar.close()">
                <md-icon md-list-icon>assignment</md-icon>
                <span md-line>Tax report</span>
            </a>
        </md-nav-list>
      </md-sidenav>
      <md-toolbar>
        <button md-icon-button (click)="sidebar.open()">
          <img src="companyicon.png" style="width: 40px; height: 40px" alt="company" />
        </button>

        <span style="margin-left: 20px">Results report</span>
      </md-toolbar>
      <accountOverview></accountOverview>
      
    </md-sidenav-layout>`
})
export class AppComponent {

}

