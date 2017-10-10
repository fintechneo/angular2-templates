/* 
 *  Copyright 2010-2016 FinTech Neo AS ( fintechneo.com )- All rights reserved
 */


import { NgModule,Component,QueryList,AfterViewInit,
  Input,Output,Renderer,
  ElementRef,
  DoCheck,NgZone,EventEmitter,OnInit,ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule,MatTooltip,MatIconModule } from '@angular/material';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export class AnimationFrameThrottler {

    static taskMap : {[key : string] : Function}= null;
    static hasChanges :boolean = false;
    static mainLoop() {
        AnimationFrameThrottler.taskMap = {};        
        
        let mainLoop = () => {
          if(AnimationFrameThrottler.hasChanges) {      
            AnimationFrameThrottler.hasChanges = false;
            Object.keys(AnimationFrameThrottler.taskMap).forEach( 
              (key)=> {
                AnimationFrameThrottler.taskMap[key]();
                delete AnimationFrameThrottler.taskMap[key];
              });
          }
          window.requestAnimationFrame(() => mainLoop());
        };
        window.requestAnimationFrame(() => mainLoop());
    }

    constructor(private taskkey : string,private task : Function) {
        if(!AnimationFrameThrottler.taskMap) {
            AnimationFrameThrottler.mainLoop();
        }
        AnimationFrameThrottler.taskMap[taskkey] = task;
        AnimationFrameThrottler.hasChanges = true;
    }
}

export interface CanvasTableSelectListener {
    rowSelected(rowIndex : number, colIndex : number,rowContent: any,multiSelect? : boolean) : void;  
    isSelectedRow(rowObj : any) : boolean;
    isBoldRow(rowObj : any) : boolean;
}

export interface CanvasTableColumn {
  name : string;
  columnSectionName?: string,
  footerText? : string;
  footerSumReduce? (prev : number,curr : number) : number;
  width: number;
  backgroundColor?: string,
  tooltipText?: string,
  sortColumn: number;  
  excelCellAttributes?: any,
  rowWrapModeHidden?: boolean;
  rowWrapModeMuted?: boolean;
  rowWrapModeChipCounter?: boolean; // E.g. for displaying number of messages in conversation in a "chip"/"badge"
  checkbox?: boolean; // checkbox for selecting rows
  textAlign?: number, // default = left, 1 = right, 2 = center
  compareValue?: (a: any,b: any) => number;  
  getValue(rowobj : any) : any;
  setValue?: (rowobj : any,val : any) => void;
  getFormattedValue? (val : any) : string;
}

export class FloatingTooltip {
  constructor(public top : number, 
    public left : number,
    public width : number,
    public height : number,
    public tooltipText : string) {

  }
}

export class CanvasTableColumnSection {
    constructor(
        public columnSectionName : string,
        public width: number,
        public leftPos: number,
        public backgroundColor : string) {
            
    }    
}

@Component({
  selector: 'canvastable',
  template: `    
    <canvas #thecanvas style="position: absolute; width: 100%; height: 100%; user-select: none;" 
        tabindex="0"></canvas>
        <div #columnOverlay draggable="true" [matTooltip]="floatingTooltip.tooltipText" style="position: absolute;"
              (DOMMouseScroll)="floatingTooltip=null"
              (mousewheel)="floatingTooltip=null"
              (mousemove)="canv.onmousemove($event)"               
              (click)="columnOverlayClicked($event)"
              [style.top.px]="floatingTooltip.top" 
              [style.left.px]="floatingTooltip.left"
              [style.width.px]="floatingTooltip.width"
              [style.height.px]="floatingTooltip.height"
                *ngIf="floatingTooltip" 
              (dragstart)="dragColumnOverlay($event)"
              >              
    </div>
    `    
})
export class CanvasTableComponent implements AfterViewInit,DoCheck {
  static incrementalId: number = 1;
  public elementId : string;
  private _topindex:number = 0.0;
  public get topindex(): number {return this._topindex; };
  public set topindex(topindex : number) { 
    if(this._topindex!==topindex) {
       this._topindex=topindex;
       this.hasChanges = true; 
    }
  }
  
  @ViewChild("thecanvas") canvRef : ElementRef;
  
  @ViewChild(MatTooltip) columnOverlay : MatTooltip;  

  private canv : HTMLCanvasElement;

  private ctx : any;
  private _rowheight:number = 30;
  private fontheight:number = 16;
  
  public fontFamily : string = 'Roboto, "Helvetica Neue", sans-serif';
  
  private maxVisibleRows:number;

  private scrollBarRect:any;

  private touchdownxy: any;
  private scrollbardrag : Boolean  = false;

  public _horizScroll:number = 0;
  public get horizScroll(): number {return this._horizScroll; };
  public set horizScroll(horizScroll : number) { 
    if(this._horizScroll!==horizScroll) {
       this._horizScroll=horizScroll;
       this.hasChanges = true; 
    }
  }

  public _rows : any[] = [];

  public _columns : CanvasTableColumn[] = [];
  public get columns(): CanvasTableColumn[] {return this._columns; };
  public set columns(columns : CanvasTableColumn[]) { 
    if(this._columns!==columns) {
       this._columns=columns;
       this.recalculateColumnSections();
       this.calculateColumnFooterSums();
       this.hasChanges = true; 
    }
  }
      

  public hoverRowColor : string = "rgba(0, 0, 0, 0.04)";
  public selectedRowColor : string = "rgba(225, 238, 255, 1)";

  public colpaddingleft = 10;
  public colpaddingright = 10;
  public seprectextraverticalpadding = 4; // Extra padding above/below for separator rectangles 

  private lastMouseDownEvent : MouseEvent;
  private _hoverRowIndex : number;
  private get hoverRowIndex() : number { return this._hoverRowIndex};
  private set hoverRowIndex(hoverRowIndex : number) {
      if (this._hoverRowIndex !== hoverRowIndex) {
          this._hoverRowIndex = hoverRowIndex;
          this.hasChanges = true;
      }
  };
  
  // Auto row wrap mode (width based on iphone 5) - set to 0 to disable row wrap mode
  public autoRowWrapModeWidth: number = 540;
  
  public rowWrapMode : boolean = true;
  public rowWrapModeWrapColumn : number = 2;

  public hasChanges : boolean;
  
  private formattedValueCache : { [key:string]:string; }  = {};
  
  public columnSections: CanvasTableColumnSection[] = [];
  
  public scrollLimitHit : BehaviorSubject<number> = new BehaviorSubject(0);

  public floatingTooltip : FloatingTooltip;
  
  @Input() selectListener : CanvasTableSelectListener;
  @Output() touchscroll = new EventEmitter();

  constructor(elementRef: ElementRef,private renderer : Renderer, private _ngZone : NgZone) {
    //this.elementId = "canvasTable"+(CanvasTableComponent.incrementalId++);
    //console.log("Creating canvas table with id "+this.elementId);    
  }

  ngDoCheck() {            
    if(this.canv) {    

        let devicePixelRatio = window.devicePixelRatio ? window.devicePixelRatio : 1;
        let wantedWidth = Math.floor(this.canv.scrollWidth*devicePixelRatio);
        let wantedHeight = Math.floor(this.canv.scrollHeight*devicePixelRatio);
        
        if(this.canv.width!==wantedWidth || this.canv.height !== wantedHeight) {                                  
            this.canv.width = wantedWidth;
            this.canv.height = wantedHeight;     
            if(devicePixelRatio!==1) {
              this.ctx.scale(window.devicePixelRatio ,window.devicePixelRatio);
            } 
            this.maxVisibleRows =  this.canv.scrollHeight/this.rowheight;
            this.hasChanges = true;
            if(this.canv.scrollWidth<this.autoRowWrapModeWidth) {              
              this.rowWrapMode = true;
            } else {
              this.rowWrapMode = false;
            }            
        }
    }    
  }
  
  ngAfterViewInit() {
    this.canv = this.canvRef.nativeElement;
    this.ctx = this.canv.getContext("2d");    
    
    
    this.canv.addEventListener("DOMMouseScroll",(event : MouseWheelEvent) => {
        event.preventDefault();
        this.topindex-=-1*event.detail/1;
        this.enforceScrollLimit();        
    });

    this.canv.onmousewheel = (event : MouseWheelEvent) => {
        event.preventDefault();
        this.topindex-=event.wheelDelta/100;
        this.enforceScrollLimit();
    };

    let checkIfScrollbarArea = (clientX : number,clientY : number,wholeScrollbar?:boolean) => {
      if(!this.scrollBarRect) {
        return false;
      }
      let canvrect = this.canv.getBoundingClientRect();
      let x = clientX-canvrect.left;
      let y =  clientY-canvrect.top;
      return x>this.scrollBarRect.x && x<this.scrollBarRect.x+this.scrollBarRect.width &&
              (wholeScrollbar || y>this.scrollBarRect.y && y<this.scrollBarRect.y+this.scrollBarRect.height);
    }

    let checkScrollbarDrag = (clientX : number,clientY : number) => {

      if(!this.scrollBarRect) {
        return;
      }

      let canvrect = this.canv.getBoundingClientRect();
      this.touchdownxy = {x: clientX-canvrect.left, y: clientY-canvrect.top};
      if(checkIfScrollbarArea(clientX,clientY)) {
          this.scrollbardrag = true;
      }
    }

    this.canv.onmousedown = (event : MouseEvent) => {
      event.preventDefault();
      checkScrollbarDrag(event.clientX,event.clientY);
      this.lastMouseDownEvent = event;
    };

    let previousTouchY : number;
    let previousTouchX : number;
    let touchMoved : boolean = false;

    this.canv.addEventListener('touchstart',(event : TouchEvent) => {       
           
       this.canv.focus(); // Take away focus from search field
       previousTouchX = event.targetTouches[0].clientX;
       previousTouchY = event.targetTouches[0].clientY;
       if(checkScrollbarDrag(event.targetTouches[0].clientX,event.targetTouches[0].clientY)) {
            event.preventDefault();
       }

       touchMoved = false;
    });

    this.canv.addEventListener('touchmove',(event : TouchEvent) => {
        event.preventDefault();
        touchMoved = true;
        if(event.targetTouches.length===1) {
          let newTouchY = event.targetTouches[0].clientY;
          let newTouchX = event.targetTouches[0].clientX;
          if(this.scrollbardrag===true) {            
            this.doScrollBarDrag(newTouchY);
          } else {
            this.topindex-=(newTouchY-previousTouchY)/this.rowheight;
            if(!this.rowWrapMode) {
              this.horizScroll -= (newTouchX-previousTouchX);
            }
            
            previousTouchY = newTouchY;
            previousTouchX = newTouchX;
          }
          this.enforceScrollLimit();   
          this.touchscroll.emit(this.horizScroll);
        }
             
    },false);

    this.canv.addEventListener('touchend',(event : TouchEvent) => {
      event.preventDefault();
      if(!touchMoved) {
        this.selectRow(event.changedTouches[0].clientX,event.changedTouches[0].clientY);
      }
      if(this.scrollbardrag) {        
        this.scrollbardrag = false;        
      }
    });
    
    this.renderer.listenGlobal('window', 'mousemove', (event : MouseEvent) => {      
      if(this.scrollbardrag===true) {
        event.preventDefault();
        this.doScrollBarDrag(event.clientY);
      } 
    });

    this.canv.onmousemove = (event : MouseEvent) => {
      if(this.scrollbardrag===true) {
        event.preventDefault();
        return;
      }
    
      let canvrect = this.canv.getBoundingClientRect();
      let newHoverRowIndex = Math.floor(this.topindex+(event.clientY-canvrect.top)/this.rowheight);
      if(this.scrollbardrag || checkIfScrollbarArea(event.clientX,event.clientY,true)) {
        newHoverRowIndex = null;
      }
      
      if(this.hoverRowIndex!==newHoverRowIndex) {
        this.hoverRowIndex = newHoverRowIndex;         
        if(this.lastMouseDownEvent) {                  
          
          this.selectRow(this.lastMouseDownEvent.clientX,event.clientY);
        }        
      }
      if(this.hoverRowIndex!==null) {
        let clientX = event.clientX-canvrect.left;
        let colIndex = this.getColIndexByClientX(clientX);
        let colStartX = this.columns.reduce((prev,curr,ndx) => ndx<colIndex ? prev+curr.width : prev,0);
        
        if(!event.shiftKey && !this.lastMouseDownEvent && this.columns[colIndex] && this.columns[colIndex].tooltipText) {
            this.floatingTooltip = new FloatingTooltip(
                (this.hoverRowIndex-this.topindex)*this.rowheight,
                colStartX-this.horizScroll,
                this.columns[colIndex].width,
                this.rowheight,this.columns[colIndex].tooltipText);            
            setTimeout(() => {
                if(this.columnOverlay) {
                  this.columnOverlay.show(1000);
                }
              },0);
        } else {
          this.floatingTooltip = null;
        }
      } else {
        this.floatingTooltip = null;
      }
    };
    this.canv.onmouseout = (event : MouseEvent) => {      
      let newHoverRowIndex = null;
      if(this.hoverRowIndex!==newHoverRowIndex) {        
        this.hoverRowIndex = newHoverRowIndex;        
      }
    };

    this.renderer.listenGlobal('window', 'mouseup',(event : MouseEvent) => {
        this.touchdownxy = undefined;
        this.lastMouseDownEvent = undefined;
        if(this.scrollbardrag) {
          this.scrollbardrag = false;          
        }
    });

    this.canv.onmouseup = (event : MouseEvent) => {
        event.preventDefault();
        if(!this.scrollbardrag &&
          this.lastMouseDownEvent &&
          event.clientX===this.lastMouseDownEvent.clientX &&
          event.clientY===this.lastMouseDownEvent.clientY) {
          this.selectRow(event.clientX,event.clientY);          
        }
        this.lastMouseDownEvent = null;
    };  
      

    this.renderer.listenGlobal('window', 'resize', () => true);

    let paintLoop = () => {
        if(this.hasChanges) {
          try {
            this.dopaint();
          } catch(e) {
            console.log(e);
          }
          this.hasChanges = false;
        }
        window.requestAnimationFrame(() => paintLoop());
    }

    this._ngZone.runOutsideAngular(() => 
        window.requestAnimationFrame(() => paintLoop())
    );                    
  } 

  public dragColumnOverlay(event : DragEvent) {    
    let canvrect = this.canv.getBoundingClientRect();    
    let selectedColIndex = this.getColIndexByClientX(event.clientX-canvrect.left);    
    let selectedRowIndex = Math.floor(this.topindex+(event.clientY-canvrect.top)/this.rowheight);    
                    
    if(!this.columns[selectedColIndex].checkbox) {
      console.log("Dragstart",event);
      event.dataTransfer.setData("text/plain", "rowIndex:"+selectedRowIndex);
    } else {
      event.preventDefault();
      this.lastMouseDownEvent = event;
    }

    this.selectListener.rowSelected(selectedRowIndex, -1, this.rows[selectedRowIndex]);              
    this.hasChanges = true;        
  }

  public columnOverlayClicked(event : MouseEvent) {    
      this.lastMouseDownEvent = null;
      this.selectRow(event.clientX,event.clientY);          
  }

  public doScrollBarDrag(clientY : number) {
    let canvrect = this.canv.getBoundingClientRect();
    this.topindex = this.rows.length*((clientY-canvrect.top)/this.canv.scrollHeight);

    this.enforceScrollLimit();   
  }

  public getColIndexByClientX(clientX : number) {
    let x = -this.horizScroll;
    let selectedColIndex=0;
    for(;selectedColIndex<this.columns.length;selectedColIndex++) {
      let col = this.columns[selectedColIndex];
      if(clientX>=x && clientX<x+col.width) {
        break;
      }
      x+=col.width;
    }
    return selectedColIndex;
  }

  public selectRow(clientX:number, clientY:number, multiSelect? : boolean) {    
    let canvrect = this.canv.getBoundingClientRect();
    clientX-=canvrect.left;
    
    let selectedRowIndex = Math.floor(this.topindex+(clientY-canvrect.top)/this.rowheight);
        
    this.selectListener.rowSelected(selectedRowIndex, 
          this.getColIndexByClientX(clientX), 
          this.rows[selectedRowIndex],
          multiSelect);              
    this.hasChanges = true;
  }

  public scrollTop() {
    this.topindex = 0;
    this.hasChanges = true;
  }

  public get rows() : any[] {
    return this._rows;
  }

  public set rows(rows : any[]) {
    if(this._rows!==rows) {
        this._rows = rows;    
        this.calculateColumnFooterSums();
        this.hasChanges = true;        
    }    
  }
  
  public calculateColumnFooterSums() : void {
      this.columns.forEach((col) => {          
          if (col.footerSumReduce) {              
              col.footerText = col.getFormattedValue(
                    this.rows.reduce((prev,row) => col.footerSumReduce(prev,col.getValue(row)),0)
                );                            
          }
      });
  }
  
  public recalculateColumnSections() : void {    
    let leftX = 0;
    this.columnSections = this.columns.reduce((accumulated,current) => {
            let ret;
            if(accumulated.length === 0 || 
                accumulated[accumulated.length - 1].columnSectionName !== current.columnSectionName) {
                
                ret = accumulated.concat([
                    new CanvasTableColumnSection(current.columnSectionName, 
                        current.width,
                        leftX,
                        current.backgroundColor)]);
            } else if(accumulated.length>0 && accumulated[accumulated.length - 1].columnSectionName === current.columnSectionName) {
                accumulated[accumulated.length-1].width+=current.width;
                ret = accumulated;
            }
            leftX+=current.width;
            return ret;
        },[]);
    this.hasChanges = true;
  }
  
  
  private enforceScrollLimit() {
    if(this.topindex<0) {
        this.topindex = 0;
    } else if(this.rows.length<this.maxVisibleRows) {
        this.topindex = 0;
    } else if(this.topindex+this.maxVisibleRows>this.rows.length) {
        this.topindex = this.rows.length-this.maxVisibleRows;
        // send max rows hit events (use to fetch more data)
        this.scrollLimitHit.next(this.rows.length);
    }


    let columnsTotalWidth = this.columns.reduce((width,col) =>
      col.width+width,0);

    if(this.horizScroll<0) {
      this.horizScroll = 0;
    } else if(
      this.canv.scrollWidth<columnsTotalWidth &&
      this.horizScroll+this.canv.scrollWidth>columnsTotalWidth) {
      this.horizScroll=columnsTotalWidth-this.canv.scrollWidth;
    }
  }

  /**
   * Draws a rounded rectangle using the current state of the canvas.
   * If you omit the last three params, it will draw a rectangle
   * outline with a 5 pixel border radius
   * @param {CanvasRenderingContext2D} ctx
   * @param {Number} x The top left x coordinate
   * @param {Number} y The top left y coordinate
   * @param {Number} width The width of the rectangle
   * @param {Number} height The height of the rectangle
   * @param {Number} [radius = 5] The corner radius; It can also be an object
   *                 to specify different radii for corners
   * @param {Number} [radius.tl = 0] Top left
   * @param {Number} [radius.tr = 0] Top right
   * @param {Number} [radius.br = 0] Bottom right
   * @param {Number} [radius.bl = 0] Bottom left
   * @param {Boolean} [fill = false] Whether to fill the rectangle.
   * @param {Boolean} [stroke = true] Whether to stroke the rectangle.
   */
  private roundRect(ctx : CanvasRenderingContext2D, x : number, y : number, width : number, height : number, radius? : any, fill? : boolean, stroke? : boolean) {
    if (typeof stroke == 'undefined') {
      stroke = true;
    }
    if (typeof radius === 'undefined') {
      radius = 5;
    }
    if (typeof radius === 'number') {
      radius = {tl: radius, tr: radius, br: radius, bl: radius};
    } else {
      var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
      for (var side in defaultRadius) {
        radius[side] = radius[side] || defaultRadius[side];
      }
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    if (fill) {
      ctx.fill();
    }
    if (stroke) {
      ctx.stroke();
    }
  }

  public get rowheight() : number {
    return this.rowWrapMode ? this._rowheight *2 : this._rowheight;
  }

  public set rowheight(rowheight : number) {
    if (this._rowheight!==rowheight) {
      this._rowheight = rowheight;
      this.hasChanges = true;
    }
  }     

  private dopaint() {    
    this.ctx.textBaseline="middle";
    this.ctx.font=this.fontheight+"px "+this.fontFamily;
            
    let canvwidth : number = this.canv.scrollWidth;
    let canvheight : number = this.canv.scrollHeight;
        
    let colx= 0 -this.horizScroll;
    // Columns
    for(let colindex : number=0;colindex<this.columns.length;colindex++) {                        
        let col : CanvasTableColumn = this.columns[colindex];            
        if (colx+col.width>0 && colx<canvwidth) {            
            this.ctx.fillStyle=col.backgroundColor ? col.backgroundColor : "#fff";
            this.ctx.fillRect(colx,
                0,                
                colindex===this.columns.length-1 ? 
                  canvwidth-colx : 
                  col.width,
                canvheight
            );            
        }
        colx+=col.width;
    }
    
    if(this.rows.length<1) {
      return;
    }

    // Rows
    for(var n=this.topindex;n<this.rows.length;n+=1.0) {
        var rowIndex = Math.floor(n);

        if(rowIndex>this.rows.length) {
            break;
        }

        let rowobj = this.rows[rowIndex];

        let halfrowheight = (this.rowheight/2);
        var rowy = (rowIndex-this.topindex) * this.rowheight;
        if(rowobj) {
          // Clear row area
          // Alternating row colors:
          // let rowBgColor : string = (rowIndex%2===0 ? "#e8e8e8" : "rgba(255,255,255,0.7)");
          // Single row color:
          let rowBgColor : string = "#fff";
          
          let isBoldRow = this.selectListener.isBoldRow(rowobj);
          let isSelectedRow = this.selectListener.isSelectedRow(rowobj);
          if(this.hoverRowIndex===rowIndex) {
            rowBgColor=this.hoverRowColor;
          }
          if(isSelectedRow) {
            rowBgColor=this.selectedRowColor;
          }          
          
          this.ctx.fillStyle = rowBgColor;          
          this.ctx.fillRect(0,rowy,canvwidth,
                      this.rowheight);
                      
          let x = 0;
          for(let colindex : number=0;colindex<this.columns.length;colindex++) {                        
            let col : CanvasTableColumn = this.columns[colindex];            
            let val : any = col.getValue(rowobj);
            let formattedVal : string;
            let formattedValueCacheKey : string = colindex+":"+val;
            if (this.formattedValueCache[formattedValueCacheKey]) {
                formattedVal = this.formattedValueCache[formattedValueCacheKey];
            } else if ((""+val).length>0 && col.getFormattedValue) {
                formattedVal = col.getFormattedValue(val);
                this.formattedValueCache[formattedValueCacheKey] = formattedVal;
            } else {
                formattedVal = ""+val;
            }
            if(this.rowWrapMode && col.rowWrapModeHidden) {
              continue;
            } else if(this.rowWrapMode && col.rowWrapModeChipCounter && parseInt(val)>1) {              
              this.ctx.save();

              this.ctx.strokeStyle = "#01579B";
              if(isSelectedRow) {                
                this.ctx.fillStyle = "#000";
              } else {
                this.ctx.fillStyle = "#01579B";                
              }
              this.roundRect(this.ctx,
                canvwidth-50,
                rowy+3,
                28,
                15,10,true);
              this.ctx.font="10px "+this.fontFamily;
                
              this.ctx.strokeStyle = "#000";
              if(isSelectedRow) {
                this.ctx.fillStyle = "#01579B";
              } else {
                this.ctx.fillStyle = "#000";
              }
              this.ctx.textAlign="center";               
              this.ctx.fillText(formattedVal+"",canvwidth-36,rowy+halfrowheight-15);
              
              this.ctx.restore();
              
              continue;
            } else if(this.rowWrapMode && col.rowWrapModeChipCounter) {
              continue;
            }
            if(this.rowWrapMode && colindex === this.rowWrapModeWrapColumn) {
              x = 0;
            }
                                    
            x+= this.colpaddingleft;                        
                        
            if ((x - this.horizScroll + col.width) >= 0 && formattedVal.length>0) {
                this.ctx.fillStyle="#000";
                if(isSelectedRow) {
                  this.ctx.fillStyle="#01579B";
                }
                if(this.rowWrapMode) {
                  // Wrap rows if in row wrap mode
                  if(colindex>=this.rowWrapModeWrapColumn) {   
                    this.ctx.save();
                    this.ctx.font ="14px "+this.fontFamily;
                    this.ctx.fillStyle = "#01579B";
                    this.ctx.fillText(formattedVal,x,rowy+halfrowheight+12);  
                    this.ctx.restore();
                  } else if(col.rowWrapModeMuted) {
                    this.ctx.save();
                    this.ctx.font ="12px "+this.fontFamily;
                    this.ctx.fillStyle = "#777";
                    this.ctx.fillText(formattedVal,x,rowy+halfrowheight-15); 
                    this.ctx.restore();
                  } else {
                    if(isBoldRow) {
                      this.ctx.save();
                      this.ctx.font = "bold "+this.ctx.font;
                    }
                    this.ctx.fillText(formattedVal,x,rowy+halfrowheight-15);  
                    if(isBoldRow) {
                      this.ctx.restore();
                    }
                  }
                } else if(x-this.horizScroll<canvwidth) {                                        
                    let texty: number = rowy + halfrowheight;
                    let textx : number = x-this.horizScroll;
                                        
                    let width = col.width - this.colpaddingright - this.colpaddingleft;                   
                    
                    this.ctx.save();
                    this.ctx.beginPath();
                    this.ctx.moveTo(textx,rowy);
                    this.ctx.lineTo(textx+width,rowy);
                    this.ctx.lineTo(textx+width,rowy+this.rowheight);
                    this.ctx.lineTo(textx,rowy+this.rowheight);
                    this.ctx.closePath();                    

                    this.ctx.clip();
                    
                    if(col.checkbox) {
                      this.ctx.beginPath();
                      this.ctx.arc(textx+width/2,texty,6,0,2*Math.PI);
                      this.ctx.stroke();
                      if(val) {
                        this.ctx.beginPath();
                        this.ctx.arc(textx+width/2,texty,4,0,2*Math.PI);
                        this.ctx.fill();
                      }
                    } else {
                      if (col.textAlign===1) {                        
                          textx += width;                        
                          this.ctx.textAlign = "end";                        
                      }

                      if(isBoldRow) {
                        this.ctx.font = "bold "+this.ctx.font;
                      }
                      this.ctx.fillText(formattedVal,textx,texty);                                        
                    }
                    this.ctx.restore();
                }
            }

            x+=(Math.round(col.width*(this.rowWrapMode && col.rowWrapModeMuted ? (10/this.fontheight): 1))-this.colpaddingleft); // We've already added colpaddingleft above
          }
        } else {
          break;
        }
        if(rowy>canvheight) {
            break;
        }
        this.ctx.fillStyle="#000";
        
    }

    // Column separators
   
    if(!this.rowWrapMode) {
      // No column separators in row wrap mode
      this.ctx.strokeStyle="#bbb";
      let x = 0;
      for(let colindex : number=0;colindex<this.columns.length;colindex++) {
        this.ctx.beginPath();
        this.ctx.moveTo(x-this.horizScroll,0);
        this.ctx.lineTo(x-this.horizScroll,canvheight);
        this.ctx.stroke();
        x+=this.columns[colindex].width;
      }
    }
   
    // Scrollbar
    var scrollbarheight = canvheight/this.rows.length*this.rowheight;
    if(scrollbarheight<20) {
        scrollbarheight = 20;
    }
    var scrollbarpos =
          (this.topindex/(this.rows.length-this.maxVisibleRows))*(canvheight-scrollbarheight);

    if(scrollbarheight<canvheight) {
        var scrollbarverticalpadding = 4;
        var scrollbarwidth = 20;
        var scrollbarx = canvwidth-scrollbarwidth;
        this.ctx.fillStyle="#aaa";
        this.ctx.fillRect(scrollbarx,0,scrollbarwidth,canvheight);
        this.ctx.fillStyle="#fff";
        this.scrollBarRect = {x: scrollbarx+1,
           y: scrollbarpos+scrollbarverticalpadding/2,
           width: scrollbarwidth-2,
           height: scrollbarheight-scrollbarverticalpadding};

        if(this.scrollbardrag) {
          this.ctx.fillStyle="rgba(200,200,255,0.5)";
          this.roundRect(this.ctx,
              this.scrollBarRect.x-4,
              this.scrollBarRect.y-4,
              this.scrollBarRect.width+8,
              this.scrollBarRect.height+8,5,true);
          
          this.ctx.fillStyle="#fff";
          this.ctx.fillRect(this.scrollBarRect.x,
                  this.scrollBarRect.y,
                  this.scrollBarRect.width,
                  this.scrollBarRect.height);
        } else {
          this.ctx.fillStyle="#fff";
          this.ctx.fillRect(this.scrollBarRect.x,this.scrollBarRect.y,this.scrollBarRect.width,this.scrollBarRect.height);                    
        }
        
    }

  }  
}

@Component({
  selector: "canvastablecontainer",
  template: `
    <style>
        .footerColumn {
            position: absolute;
            bottom: 0px;
            user-select: none;
            -webkit-user-select: none;
            color: #01579B;                        
            white-space: nowrap;
            height: 25px;
            padding-top: 5px;            
            text-align: right;
            font-weight: bold;   
        }
    </style>
    <div #tablecontainer style="
          position: absolute;
          top: 0px;
          bottom: 0px;
          right: 0px;
          left: 0px;                    
          overflow-x: auto;
          overflow-y: hidden; 
          user-select: none; 
          -webkit-user-select: none;"
          (scroll)="horizScroll($event)"
          >        
        <div [hidden]="canvastable.rowWrapMode" *ngFor="let col of canvastable.columns; let colIndex = index"          
            (touchstart)="colresizestart($event.targetTouches[0].clientX,colIndex)"
            (mousedown)="colresizestart($event.clientX,colIndex)"            
            (touchmove)="$event.preventDefault();colresize($event.targetTouches[0].clientX)"
            (touchend)="colresizeend()"            
            (click)="toggleSort(col.sortColumn)"
            style="
              position: absolute;
              top: 0px;
              user-select: none;
              -webkit-user-select: none;
              color: #01579B;          
              padding-left: 5px;
              white-space: nowrap;
              height: 25px;
              padding-top: 5px;
              text-align: center;
            "
            
            [style.width]="col.width+'px'"
            [style.backgroundColor]="col.backgroundColor ? col.backgroundColor : inherit"
            [style.left]="sumWidthsBefore(colIndex)+'px'"
            [style.cursor]="col.sortColumn!==null ? 'pointer' : 'default'"
            >
            <mat-icon *ngIf="sortColumn===col.sortColumn" style="font-size: 12px;">
                {{sortDescending ? 'arrow_upward' : 'arrow_downward'}}
            </mat-icon>
            {{col.name}}          
        </div>
        <div [style.display]="canvastable.rowWrapMode ? 'flex':'none'">        
          <div *ngFor="let col of canvastable.columns; let colIndex = index"         
              (click)="toggleSort(col.sortColumn)"
              (touchstart)="$event.preventDefault();toggleSort(col.sortColumn)" style="   
                padding: 4px;                          
                margin-right: 5px;
                border-radius: 5px;
                user-select: none;
                -webkit-user-select: none;
              "
              [style.backgroundColor]="sortColumn!==col.sortColumn ? 'inherit' : '#01579B'"
              [style.color]="sortColumn===col.sortColumn ? '#fff' : '#01579B'"
              [style.cursor]="col.sortColumn!==null ? 'pointer' : 'default'"
              >
              <mat-icon *ngIf="sortColumn===col.sortColumn" style="font-size: 12px;">{{sortDescending ? 'arrow_upward' : 'arrow_downward'}}</mat-icon>{{col.name}}          
          </div>        
        </div>
        
        <div #tablebodycontainer style="position: absolute; 
          top: 25px; 
          bottom: 25px; 
          width: 100%;" 
            [style.left]="canvastable.horizScroll+'px'">          
          <canvastable [selectListener]="canvastableselectlistener"
            (touchscroll)="tablecontainer.scrollLeft=$event;tablebodycontainer.style.left=$event+'px'">
          </canvastable>
        </div>
        <div [hidden]="canvastable.rowWrapMode" *ngFor="let col of canvastable.columns; let colIndex = index"          
            (touchstart)="colresizestart($event.targetTouches[0].clientX,colIndex)"
            (mousedown)="colresizestart($event.clientX,colIndex)"            
            (touchmove)="$event.preventDefault();colresize($event.targetTouches[0].clientX)"
            (touchend)="colresizeend()"            
            (click)="toggleSort(col.sortColumn)"
            class="footerColumn"
                  
            [style.width]="col.width+'px'"
            [style.backgroundColor]="col.backgroundColor ? col.backgroundColor : inherit"
            [style.left]="(sumWidthsBefore(colIndex))+'px'"
            
            >            
            <span style="padding-right: 10px">{{col.footerText}}</span>
        </div>
    </div>    
    `
})
export class CanvasTableContainerComponent implements OnInit {
  colResizePreviousX : number;
  colResizeColumnIndex : number;
  columnResized : boolean;
  sortColumn : number = 0;
  sortDescending : boolean = false;

  savedColumnWidths : number[] = [];
  @ViewChild(CanvasTableComponent) canvastable : CanvasTableComponent;
  @Input() configname : string = "default";
  @Input() canvastableselectlistener : CanvasTableSelectListener;
  
  @Output() sortToggled : EventEmitter<any> = new EventEmitter();
  
  constructor(private renderer : Renderer) {

  }
  
  ngOnInit() {
    let savedColumnWidthsString :string = localStorage.getItem(this.configname+"CanvasTableColumnWidths");
    if(savedColumnWidthsString) {
      this.savedColumnWidths = JSON.parse(savedColumnWidthsString);
    }

    
    this.renderer.listenGlobal('window', 'mousemove', (event : MouseEvent) => { 
      if (this.colResizePreviousX) {
        event.preventDefault();
        event.stopPropagation();
        this.colresize(event.clientX);
      }
    });     
    this.renderer.listenGlobal('window', 'mouseup', (event : MouseEvent) => { 
      if (this.colResizePreviousX) {
        event.preventDefault();
        event.stopPropagation();
        this.colresizeend();
      }
    });     
  } 

  colresizestart(clientX : number,colIndex : number) {
      if(colIndex>0) {        
        this.colResizePreviousX = clientX;
        this.colResizeColumnIndex = colIndex;
      }
  }

  colresize(clientX : number) {
      if (this.colResizePreviousX) {
          new AnimationFrameThrottler("colresize",() => {
            let prevcol: CanvasTableColumn =this.canvastable.columns[this.colResizeColumnIndex - 1];
            if(prevcol && prevcol.width) {
              prevcol.width += (clientX-this.colResizePreviousX);
              if(prevcol.width<20) {
                  prevcol.width = 20;
              }     
              this.canvastable.hasChanges = true;                       
              this.columnResized = true;            
              this.colResizePreviousX = clientX; 
              this.saveColumnWidths();
            }
          });
      }      
  }
 
  public sumWidthsBefore(colIndex : number) {
    let ret : number = 0;
    for(let n : number = 0;n<colIndex;n++) {
      ret+=this.canvastable.columns[n].width;
    }
    return ret;
  }

  getSavedColumnWidth(colIndex : number,defaultWidth : number) : number { 
    return this.savedColumnWidths[colIndex] ? 
          this.savedColumnWidths[colIndex] : 
            defaultWidth;      
  }

  saveColumnWidths() {
    this.savedColumnWidths = this.canvastable.columns.map((col) => col.width)
    localStorage.setItem(this.configname+"CanvasTableColumnWidths",JSON.stringify(this.savedColumnWidths));
  }

  colresizeend() {                
      this.colResizePreviousX = null;
      this.colResizeColumnIndex = null;
  }

  horizScroll(evt : any) {
    this.canvastable.horizScroll = evt.target.scrollLeft;        
  }

  public toggleSort(column : number) {      
    if(column===null) {
      return;
    }

    if (this.columnResized) {
      this.columnResized = false;
      return;
    }
    
    if(column === this.sortColumn) {
      this.sortDescending = !this.sortDescending;
    } else {
      this.sortColumn = column;
    }
    this.sortToggled.emit({sortColumn: this.sortColumn, sortDescending: this.sortDescending});
  } 
}


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