import { NgModule }      from '@angular/core';
import { APP_BASE_HREF} from '@angular/common';
import { HttpModule,JsonpModule }      from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {MaterialModule} from '@angular/material';
import {CanvasTableModule} from './canvastable/canvastable.module';

import { AppComponent }   from './app.component';
import { AccountOverviewComponent } from './pages/accountreportcomponents';
import { SVGLineChartComponent } from './svgcharts/linechart.component';
import { TableComponent } from './pages/table.component';
import { DataService } from './data.service';

export function appBaseHrefFactory() {
    return location.pathname.substr(0,location.pathname.indexOf("index")>-1 ? 
        location.pathname.indexOf("index") : location.pathname.length);
}

@NgModule({
  imports:      [ BrowserModule,HttpModule,JsonpModule,FormsModule,
    MaterialModule,
    CanvasTableModule,
    RouterModule.forRoot([
      {
        path: "chart",
        component: AccountOverviewComponent
      },
      {
        path: "table",
        component: TableComponent
      },
      {
        path: "index_dev.html",
        component: AccountOverviewComponent
      },
      {
        path: "",
        component: AccountOverviewComponent
      }
    ])
  ],
  declarations: [ AppComponent,AccountOverviewComponent,SVGLineChartComponent,TableComponent ],
  providers: [{provide: APP_BASE_HREF, 
      useFactory: appBaseHrefFactory},
        DataService], 
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
