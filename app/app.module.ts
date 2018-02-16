import { NgModule }      from '@angular/core';
import { APP_BASE_HREF} from '@angular/common';
import { HttpModule,JsonpModule }      from '@angular/http';
import { BrowserModule, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatSidenavModule,MatToolbarModule,
    MatCardModule,
    MatInputModule,MatIconModule,
    MatExpansionModule,
    MatButtonModule,MatListModule } from '@angular/material';
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
import { ShowChartComponent } from './chart/showchart.component';
import { SVGLineChartComponent as LineChartComponent } from './chart/linechart.component';
import { ReactiveFormsDemoComponent } from './reactiveforms/reactiveformsdemo.component';
import { BookTableModule } from './booktable/booktable.module';
import { BookTableComponent } from './booktable/booktable.component';
import { XLSXModule } from './xlsxservice/xlsx.module';

@NgModule({
  imports:      [ BrowserModule,HttpModule,JsonpModule,FormsModule,
    MatSidenavModule,
    MatButtonModule,MatListModule,MatIconModule,MatInputModule,
    MatToolbarModule,
    MatCardModule,
    CanvasTableModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    BookTableModule,
    XLSXModule,
    MatExpansionModule,
    DACModule,
    RouterModule.forRoot([
      {
        path: "chart",
        component: AccountOverviewComponent
      },
      {
        path: "linechart",
        component: ShowChartComponent
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
        path: "booktable",
        component: BookTableComponent
      },
      {
        path: "qlyzetable",
        component: QlyzeTableComponent
      },
      {
        path: "reactiveforms",
        component: ReactiveFormsDemoComponent
      },
      {
        path: "index_dev.html",
        component: BookTableComponent
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'chart'
      }
    ])
  ],
  declarations: [ AppComponent,AccountOverviewComponent,SVGLineChartComponent,
      TableComponent,LargeNumberPipe,
      PiechartComponent,
      BarchartComponent,
      HorizontalBarchartComponent,
      StackedBarchartComponent,
      ReactiveFormsDemoComponent,
      StackedHorizontalBarchartComponent,
      ShowBarchartComponent,
      ShowPiechartComponent,
      QlyzeTableComponent,
      LineChartComponent,
      ShowChartComponent ],
  providers: [ DataService,PDFService, QlyzeService ], 
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
