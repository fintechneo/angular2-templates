import {Component,DoCheck,ViewChild} from '@angular/core';
import { MdSidenav} from '@angular/material';

@Component({
  selector: 'my-app',
  template: `
    <md-sidenav-container fullscreen>
      <md-sidenav #sidebar [mode]="sidenavmode" [opened]="sidenavopened">
        <p style="padding: 10px;">
          <img src="companylogo.png" style="height: 40px; width: auto" alt="companylogo" />
        </p>
        <md-nav-list>
            <a md-list-item routerLink="chart" (click)="sidemenuClose()">
                <md-icon md-list-icon>show_chart</md-icon>
                <span md-line>Chart</span>
            </a>            
            <a md-list-item routerLink="table" (click)="sidemenuClose()">
                <md-icon md-list-icon>list</md-icon>
                <span md-line>Table</span>
            </a>            
        </md-nav-list>
      </md-sidenav>
      <md-toolbar>
        <button md-icon-button (click)="sidebar.toggle()">
          <img src="companyicon.png" style="width: 36px; height: 36px" alt="company" />
        </button>

        <span style="margin-left: 20px">Results report</span>
      </md-toolbar>
      <router-outlet></router-outlet>
      
    </md-sidenav-container>`
})
export class AppComponent implements DoCheck {
    public sidenavmode : string = "over";
    public sidenavopened : boolean = false;
    @ViewChild(MdSidenav) sidemenu : MdSidenav;

    public ngDoCheck() {
      if(window.innerWidth>1024) {
        this.sidenavmode = "side";
        this.sidenavopened = true;
      } else {
        this.sidenavmode = "over";
      }
    }

    public sidemenuClose() {
        if(this.sidenavmode === "over") {
          this.sidemenu.close();
        }
    }
}