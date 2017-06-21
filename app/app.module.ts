import { NgModule }      from '@angular/core';
import { APP_BASE_HREF} from '@angular/common';
import { HttpModule,JsonpModule }      from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {MaterialModule} from '@angular/material';
import {CanvasTableModule} from './canvastable/canvastable.module';
import { DACModule } from './dac/dac.module';
import { DACAdminComponent } from './dac/dacadmin.component';
import { AppComponent }   from './app.component';
import { AccountOverviewComponent } from './pages/accountreportcomponents';
import { SVGLineChartComponent } from './svgcharts/linechart.component';
import { TableComponent } from './pages/table.component';
import { DataService } from './data.service';


@NgModule({
  imports:      [ BrowserModule,HttpModule,JsonpModule,FormsModule,
    MaterialModule,
    CanvasTableModule,
    BrowserAnimationsModule,
    DACModule,
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
        path: "dactable",
        component: DACAdminComponent
      },
      {
        path: "index_dev.html",
        component: DACAdminComponent
      },
      {
        path: "",
        component: AccountOverviewComponent
      }
    ])
  ],
  declarations: [ AppComponent,AccountOverviewComponent,SVGLineChartComponent,TableComponent ],
  providers: [ DataService ], 
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
