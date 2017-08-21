import { NgModule }      from '@angular/core';
import { APP_BASE_HREF} from '@angular/common';
import { HttpModule,JsonpModule }      from '@angular/http';
import { BrowserModule, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
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
import { PDFService } from './pdfmake/pdf.service';
import { LargeNumberPipe } from './svgcharts/largenumber.pipe';
import { PiechartComponent } from './charts/piechart/piechart.component';
import { BarchartComponent } from './charts/barchart/barchart.component';
import { HorizontalBarchartComponent } from './charts/horizontal-barchart/horizontal-barchart.component';
import { StackedBarchartComponent } from './charts/stacked-barchart/stacked-barchart.component';
import { StackedHorizontalBarchartComponent } from './charts/stacked-horizontal-barchart/stacked-horizontal-barchart.component';
import { ShowBarchartComponent } from './charts/show-barchart.component'
import { ShowPiechartComponent } from './charts/show-piechart.component'
import { QlyzeTableComponent } from './qlyze/qlyze-table.component';
import { QlyzeService } from './qlyze/qlyze.service';

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
        path: "barcharts",
        component: ShowBarchartComponent
      },
      {
        path: "piechart",
        component: ShowPiechartComponent
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
        path: "qlyzetable",
        component: QlyzeTableComponent
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
  declarations: [ AppComponent,AccountOverviewComponent,SVGLineChartComponent,
      TableComponent,LargeNumberPipe,
      PiechartComponent,
      BarchartComponent,
      HorizontalBarchartComponent,
      StackedBarchartComponent,
      StackedHorizontalBarchartComponent,
      ShowBarchartComponent,
      ShowPiechartComponent,
      QlyzeTableComponent ],
  providers: [ DataService,PDFService, QlyzeTableComponent ], 
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
