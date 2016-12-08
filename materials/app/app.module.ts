import { NgModule }      from '@angular/core';
import { HttpModule,JsonpModule }      from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppComponent }   from './app.component';

import {MaterialModule} from '@angular/material';

@NgModule({
  imports:      [ BrowserModule,HttpModule,JsonpModule,FormsModule,
    MaterialModule.forRoot()    
  ],
  declarations: [ AppComponent ],
  providers: [],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
