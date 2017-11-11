/* 
 *  Copyright 2010-2016 FinTech Neo AS ( fintechneo.com )- All rights reserved
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule,MatListModule,
  MatSidenavModule,
  MatButtonModule,
  MatIconModule,
  MatToolbarModule,
  MatInputModule,
  MatDialogModule } from '@angular/material';
import { CanvasTableModule } from '../canvastable/canvastable.module';
import { DACAdminComponent } from './dacadmin.component';
import { DACService } from './dac.service';
import { DACCodeListsService } from './daccodelists.service';

@NgModule({
  imports: [
      CommonModule,
      FormsModule,
      CanvasTableModule,
      MatCheckboxModule,
      MatSidenavModule,
      MatToolbarModule,
      MatButtonModule,
      MatIconModule,
      MatInputModule,
      MatListModule,
      MatDialogModule,
      
  ],
  declarations: [DACAdminComponent],
  exports: [DACAdminComponent],  
  providers: [DACCodeListsService],
  entryComponents: []
})
export class DACModule {

}