import {Component} from '@angular/core';

@Component({
  selector: 'my-app',
  template: `
    <md-sidenav-layout fullscreen>
      <md-sidenav #sidebar>
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
          <md-icon>toc</md-icon>
        </button>

        <span>Results report</span>
      </md-toolbar>
      <accountOverview></accountOverview>
      
    </md-sidenav-layout>`
})
export class AppComponent {

}

