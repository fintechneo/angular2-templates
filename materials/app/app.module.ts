import { NgModule }      from '@angular/core';
import { HttpModule,JsonpModule }      from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import {MaterialModule} from '@angular/material';

import { AppComponent }   from './app.component';
import { AccountOverviewComponent,AccountChartComponent } from './accountreportcomponents';
import { SVGLineChartComponent } from './svgcharts/linechart.component';

@NgModule({
  imports:      [ BrowserModule,HttpModule,JsonpModule,FormsModule,
    MaterialModule.forRoot()    
  ],
  declarations: [ AppComponent,AccountOverviewComponent,AccountChartComponent,SVGLineChartComponent ],
  providers: [],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
