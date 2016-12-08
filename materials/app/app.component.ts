import {Component} from '@angular/core';

@Component({
  selector: 'my-app',
  template: `
    <md-sidenav-layout fullscreen>
      <md-sidenav #sidebar>
        <md-nav-list>
            <a md-list-item (click)="sidebar.close()">
                <md-icon md-list-icon>assignment</md-icon>
                <span md-line>Menu item 1</span>
            </a>
            <a md-list-item (click)="sidebar.close()">
                <md-icon md-list-icon>assignment</md-icon>
                <span md-line>Menu item 2</span>
            </a>
        </md-nav-list>
      </md-sidenav>
      <md-toolbar [color]="myColor">
        <button md-icon-button (click)="sidebar.open()">
          <md-icon>toc</md-icon>
        </button>

        <span> Fintech Neo - Angular2 materials template</span>
      </md-toolbar>
      <accountOverview></accountOverview>
      <accountChart></accountChart>
      
    </md-sidenav-layout>`
})
export class AppComponent {

}

