import {Component,DoCheck,ViewChild} from '@angular/core';
import { MatSidenav} from '@angular/material';

@Component({
  selector: 'my-app',
  template: `
    <mat-sidenav-container fullscreen>
      <mat-sidenav #sidebar [mode]="sidenavmode">
        <p style="padding: 10px;">
          <img src="companylogo.png" style="height: 40px; width: auto" alt="companylogo" />
        </p>
        <mat-nav-list>
            <a mat-list-item routerLink="chart" (click)="sidemenuClose()">
                <mat-icon mat-list-icon>show_chart</mat-icon>
                <span mat-line>Chart</span>
            </a> 
            <a mat-list-item routerLink="linechart" (click)="sidemenuClose()">
            <mat-icon mat-list-icon>show_chart</mat-icon>
            <span mat-line>Multi-lined linechart</span>
            </a>             
            <a mat-list-item routerLink="table" (click)="sidemenuClose()">
                <mat-icon mat-list-icon>list</mat-icon>
                <span mat-line>Table</span>
            </a>            
            <a mat-list-item routerLink="dactable" (click)="sidemenuClose()">
                <mat-icon mat-list-icon>list</mat-icon>
                <span mat-line>DAC CRS codes</span>
            </a>   
            <a mat-list-item routerLink="qlyzetable" (click)="sidemenuClose()">
                <mat-icon mat-list-icon>list</mat-icon>
                <span mat-line>Qlyze table</span>
            </a>     
            <a mat-list-item routerLink="booktable" (click)="sidemenuClose()">
                <mat-icon mat-list-icon>list</mat-icon>
                <span mat-line>Books</span>
            </a>   
            <a mat-list-item routerLink="piechart" (click)="sidemenuClose()">
                <mat-icon mat-list-icon>pie_chart</mat-icon>
                <span mat-line>Piechart</span>
            </a>   
            <a mat-list-item routerLink="barcharts" (click)="sidemenuClose()">
                <mat-icon mat-list-icon>insert_chart</mat-icon>
                <span mat-line>Barcharts</span>
            </a> 
                 
            <a mat-list-item routerLink="reactiveforms" (click)="sidemenuClose()">
               <mat-icon mat-list-icon>form</mat-icon>
                <span mat-line>Form</span>
            </a> 
                
        </mat-nav-list>
      </mat-sidenav>
      <mat-toolbar style="display: flex">
        <button mat-icon-button (click)="sidebar.toggle()">
          <mat-icon>menu</mat-icon>              
        </button>        
        <p style="flex-grow: 1"></p>
        <img src="companyicon.png" style="width: 36px; height: 36px" alt="company" />
      </mat-toolbar>
      <router-outlet></router-outlet>
      
    </mat-sidenav-container>`
})
export class AppComponent implements DoCheck {
    public sidenavmode : string = "over";
    public sidenavopened : boolean = false;
    @ViewChild(MatSidenav) sidemenu : MatSidenav;

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