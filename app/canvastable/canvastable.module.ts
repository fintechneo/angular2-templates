/* 
 *  Copyright 2010-2016 FinTech Neo AS ( fintechneo.com )- All rights reserved
 */


import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule,MatTooltip,MatIconModule } from '@angular/material';
import { CanvasTableComponent,CanvasTableContainerComponent } from './canvastable.component';
export { CanvasTableColumn, CanvasTableComponent, CanvasTableContainerComponent, CanvasTableSelectListener, AnimationFrameThrottler} from './canvastable.component';

@NgModule({
  imports: [
      CommonModule,
      MatTooltipModule,
      MatIconModule
  ],
  declarations: [CanvasTableComponent,CanvasTableContainerComponent],
  exports: [CanvasTableComponent,CanvasTableContainerComponent]
})
export class CanvasTableModule {

}