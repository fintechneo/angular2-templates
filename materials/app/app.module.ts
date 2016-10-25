import { NgModule }      from '@angular/core';
import { HttpModule,JsonpModule }      from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppComponent }   from './app.component';

import {MdInputModule} from '@angular2-material/input';
import {MdIconModule} from '@angular2-material/icon';
import {MdButtonModule} from '@angular2-material/button';

@NgModule({
  imports:      [ BrowserModule,HttpModule,JsonpModule,FormsModule,
    MdInputModule.forRoot(),
    MdIconModule.forRoot(),
    MdButtonModule.forRoot()
  ],
  declarations: [ AppComponent ],
  providers: [],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
