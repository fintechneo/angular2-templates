import { Component,Input,ViewChild,OnInit,OnDestroy,AfterViewInit,DoCheck,Renderer2 } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/throttle';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

const SPACE_BETWEEN_POINTS : number = 5;    

export class LineConfig {
    color: string;
    columnIndex: number;
    scaleIndex: number;
    unit: string;
}

export class LineChartConfig {
    lines : LineConfig[];
    leftUnit: string;
    rightUnit: string;
}

export class HoverYValue {
    originalValue: number;
    chartY: number;    
}

@Component({
    moduleId: "app/chart/",
    selector: "linechart",
    templateUrl: 'linechart.component.html',
    providers: [DatePipe]
})
export class LineChartComponent implements AfterViewInit,OnInit,OnDestroy,DoCheck {
    _datapoints : any[] = [];
    mouseMoveSubject : Subject<any> = new Subject();
    mouseUpSubject : Subject<any> = new Subject();
    viewChangeSubject : Subject<any> = new Subject();
    scaledDataPoints : any[] = [];
    scaledDataPointsSubject : Subject<any> = new Subject();

    chartYLabels : any[] = [];
    chartYLabelsRight : any[] = [];
    
    @Input() xaxisnav : boolean = true;
    @Input() chartConfig : LineChartConfig;

    pathStrings : string[] = [];

    public chartBoxLeft : number = 50;
    public chartBoxRight : number = 200;

    public svgLeft : number;

    
    public viewBox : string;

    lastTouchHoverX : number;
    hoverX : number;
    
    hoverXvalue : number;
    hoverYvalues : HoverYValue[];
    
    hoverTextY : number;        
    
    hoverLineTransform : string;
    hoverOpacity : number = 0.0;
       
    chartXLabels : any[];    

    width : number;
    height : number;

    dataMinY : number;
    dataMaxY : number;

    dataRightScaleMinY : number;
    dataRightScaleMaxY : number;

    chartBoxTop : number = 20;    

    prevBounds : number[] = [0,0,500,500];
    
    @ViewChild("svgelement") svgElm : any;
   
    destroyTasks : (() => void)[] = []

    shortTimeMap : {[ts : number] : string} = {};
    shortDateMap : {[ts : number] : string} = {};

    constructor(private renderer: Renderer2,
        private datepipe : DatePipe) {

    }
   

   ngDoCheck() {       
        let bounds : any = this.svgElm.nativeElement.getBoundingClientRect();
        
        if(
            bounds.left!==this.prevBounds[0] ||
            bounds.top!==this.prevBounds[1] ||
            bounds.width!==this.prevBounds[2] ||
            bounds.height!==this.prevBounds[3]
        ) {            
            this.prevBounds[0] = bounds.left;
            this.prevBounds[1] = bounds.top;
            this.prevBounds[2] = bounds.width;
            this.prevBounds[3] = bounds.height;
            
            this.width = bounds.width;
            this.height = bounds.height;
            this.svgLeft = bounds.left;
            
            this.viewBox = "0 0 "+
                        this.width+" "+
                        this.height;

            this.chartBoxRight = this.width-40;

            this.updateScaledDataPoints();
        }
   }

   ngOnInit() {
       
   }

   ngOnDestroy() {
       this.destroyTasks.forEach((cb) => cb());       
   }

   
   ngAfterViewInit() {              
        this.destroyTasks.push(this.renderer.listen('window',"mousemove",(evt : any) =>  {  
                evt.preventDefault();                         
                this.mouseMoveSubject.next({clientX: evt.clientX,clientY: evt.clientY});                    
            }
        ));

        this.destroyTasks.push(this.renderer.listen('window',"touchmove",(evt : any) => {
                evt.preventDefault();
                this.mouseMoveSubject.next(
                    {clientX: evt.targetTouches[0].clientX,
                    clientY: evt.targetTouches[0].clientY
                });
            }
        ));
                      
        this.destroyTasks.push(this.renderer.listen('window',"mouseup",(evt : any) => {
            evt.preventDefault();
            this.mouseUpSubject.next(evt);
        }));
        this.destroyTasks.push(this.renderer.listen('window',"touchend",(evt : any) => {
            evt.preventDefault();
            this.mouseUpSubject.next(evt);
        }));   

        /*this.scaledDataPointsSubject
            .throttle((evt) => Observable.of(50))
            .subscribe(() => this.calculateScaledDataPoints());*/
        this.updateScaledDataPoints();            
   }

   @Input() 
   public set datapoints(datapoints : any[]) {
       if(!this.horizNavLeft) {
           this.horizNavLeft = datapoints[0][0];
       }
       if(!this.horizNavRight) {
           this.horizNavRight = datapoints[datapoints.length-1][0];
       }
       this._datapoints = datapoints;
   }

   public handleTouchHover(e: TouchEvent) {
       let chartBounds = this.svgElm.nativeElement.getBoundingClientRect();
       let x = e.targetTouches[0].clientX-chartBounds.left;
       let y = e.targetTouches[0].clientY-chartBounds.top;
       
       if(
           x>this.chartBoxLeft && 
           x<this.chartBoxRight &&
           y>this.chartBoxTop && 
           y<this.getChartBoxBottom()) {
        e.preventDefault();
        this.lastTouchHoverX = x;        
        this.updateHover(x);
       }       
   }

   public handleHover(e : MouseEvent | any) {
        let chartBounds = this.svgElm.nativeElement.getBoundingClientRect();
        let x = e.clientX-chartBounds.left;        
        
        this.updateHover(x);
   }

   public updateHover(hoverX : number) {        
        let hoverPt = this.scaledDataPoints.find((arr) =>         
            hoverX<(arr[0]+SPACE_BETWEEN_POINTS/2));
        
        if(hoverX>1 && hoverPt!==undefined) {
            this.hoverXvalue = hoverPt[1];
            this.hoverX = Math.round(hoverPt[0]);

            let middlePos = this.chartBoxRight-((this.chartBoxRight-this.chartBoxLeft) / 2);

            let hoverYvalues = this.chartConfig.lines.map((conf) => {
                return {
                    originalValue: hoverPt[conf.columnIndex*2+3],
                    chartY: hoverPt[conf.columnIndex*2+2],
                    labelX: this.hoverX<middlePos ? 60 : -60,
                    labelY: hoverPt[conf.columnIndex*2+2]
                }
            });
            
            this.hoverYvalues = hoverYvalues.slice(0);

            // -- Assure distance between labels
            hoverYvalues.sort((a,b) => a.labelY-b.labelY);
            
            let lastLabelY = 0;
            hoverYvalues.forEach((curr,ndx)=> {                                
                if(curr.labelY-lastLabelY<30) {
                    curr.labelY=lastLabelY+30;
                }                
                lastLabelY=curr.labelY;                
            });

            hoverYvalues.sort((a,b) => b.labelY-a.labelY);

            lastLabelY = this.getChartBoxBottom();
            hoverYvalues.forEach((curr,ndx)=> {                                
                if(lastLabelY-curr.labelY<30) {
                    curr.labelY=lastLabelY-30;
                }                
                lastLabelY=curr.labelY;                
            });
            
            // -------------------

            this.hoverTextY = Math.round(hoverPt[2]+10);
            
            let bottom = this.getChartBoxBottom()-27;
            if(this.hoverTextY>bottom) {
                this.hoverTextY = bottom;
            }   
            
            this.hoverLineTransform="translate("+this.hoverX+",0)";
            this.hoverOpacity = 1.0;
        } else {
            
        }
        
   }

   public get datapoints() : any[] {
       return this._datapoints;
   }     

    // ----------- X axis navigator functions

    public _horizNavLeft : number;
    public _horizNavRight : number;

    public get horizNavLeft() : number {
        return this._horizNavLeft;
    }

    public set horizNavLeft(horizNavLeft : number) {
        if(horizNavLeft) {
            this._horizNavLeft = horizNavLeft;
            this.updateScaledDataPoints();
        }    
    }

    public get horizNavRight() : number {
        return this._horizNavRight;
    }

    public set horizNavRight(horizNavRight : number) {
        if(horizNavRight) {
            this._horizNavRight = horizNavRight;
            this.updateScaledDataPoints();
        }
    }
            
    public getChartHorizNavY() : number {
        return this.height-20;
    }

    public getChartHorizNavLeft() : number {
        let minx = this.getDataMinX();
        let width = this.getDataWidth();
        let viewLeft = this.chartBoxLeft;
        let viewWidth = this.chartBoxRight-viewLeft;
        return viewLeft+((this.horizNavLeft-minx)*viewWidth/width)
    }

    public getChartHorizNavRight() : number {
        let minx = this.getDataMinX();
        let width = this.getDataWidth();
        let viewLeft = this.chartBoxLeft;
        let viewWidth = this.chartBoxRight-viewLeft;
        return viewLeft+((this.horizNavRight-minx)*viewWidth/width)
    }

    public dragHorizNavLeft(evt : Event) {
        evt.preventDefault();
        let minx = this.getDataMinX();
        let width = this.getDataWidth();
        let viewLeft = this.chartBoxLeft;
        let viewWidth = this.chartBoxRight-viewLeft;
        

        let movesubscription = this.mouseMoveSubject
            .throttle((evt) => Observable.of(20))
            .map((evt) => evt.clientX-this.svgLeft-viewLeft)            
            .filter((clientx) => clientx+viewLeft<this.getChartHorizNavRight()-30)                      
            .map((clientx : number) => minx+((clientx)/viewWidth)*this.getDataWidth())                        
            .map((d) => d<minx ? minx : d)
            .subscribe((d : number) => {
                this.horizNavLeft = d;
                this.updateScaledDataPoints();
            });

        let upsubscription = this.mouseUpSubject.subscribe((evt : any) => {
            movesubscription.unsubscribe();
            upsubscription.unsubscribe();
        });
    }

    public dragHorizNavRight(evt : Event) {
        evt.preventDefault();
        let minx = this.getDataMinX();
        let width = this.getDataWidth();
        let viewLeft = this.chartBoxLeft;
        let viewWidth = this.chartBoxRight-viewLeft;        

        let maxx = this.datapoints[this.datapoints.length-1][0];

        let movesubscription = this.mouseMoveSubject
            .throttle((evt) => Observable.of(20))
            .map((evt) => evt.clientX-this.svgLeft-viewLeft)            
            .filter((clientx) => 
                    clientx+viewLeft>this.getChartHorizNavLeft()+30
                    )
            .map((clientx : number) => 
                minx+((clientx
                )/viewWidth)*this.getDataWidth()
            )      
            .map((d) => d>maxx ? maxx : d)     
            .subscribe((d : number) => {
                this.horizNavRight = d;
                this.updateScaledDataPoints();
            });

        let upsubscription = this.mouseUpSubject.subscribe((evt : any) => {
            movesubscription.unsubscribe();
            upsubscription.unsubscribe();            
        });
    }

    // ------------ Chart box functions

        
    public getChartBoxBottom() {
        return this.getChartHorizNavY()-(this.xaxisnav ? 60 : 10);
    }


    public getDataMinX() : number {
        return this.datapoints[0][0];
    }

    public getDataWidth() : number {
        return this.datapoints[this.datapoints.length-1][0]
                    -this.datapoints[0][0];
    }

    public updateChartXLabels() {
        let minx = this.horizNavLeft;
        let width = this.horizNavRight-minx;
        let viewLeft = this.chartBoxLeft;
        let viewWidth = this.chartBoxRight-viewLeft;

        const shortDate = (d : number) => {
            if(!this.shortDateMap[d]) {
                this.shortDateMap[d] = this.datepipe.transform(d,"shortDate");
            }
            return this.shortDateMap[d];                
        };
        const shortTime = (d : number) => {
            if(!this.shortTimeMap[d]) {
                this.shortTimeMap[d] = this.datepipe.transform(d,"shortTime");
            }
            return this.shortTimeMap[d];                
        };

        this.chartXLabels = this.datapoints
            .filter((d : any)=>d[0]>=this.horizNavLeft)
            .filter((d : any)=>d[0]<=this.horizNavRight)
            .reduce((prev : Array<any>,d : any) =>
                    prev.length>0 && viewLeft+
                    ((d[0]-minx)*viewWidth/width)
                    -prev[prev.length-1][0] < 100 ? 
                        prev : 
                        prev.concat(
                            [
                                [
                                    viewLeft+((d[0]-minx)*viewWidth/width),
                                    d[0],
                                    prev.length===0 || 
                                        new Date(prev[prev.length-1][1]).getDate()!==
                                        new Date(d[0]).getDate() ?    
                                    shortDate(d[0]) :
                                    shortTime(d[0])

                                ]
                            ]
                        )
                ,[]);        
    }

    private createChartYLabels() : any[] {
        let miny = this.dataMinY;
        let maxy = this.dataMaxY;
        let dataheight = maxy-miny;
        let chartBottom = this.getChartBoxBottom();
        let viewHeight = chartBottom-this.chartBoxTop;
        let maxYlabels = viewHeight / 20; // Min 20 pixels between y labels
        let step = dataheight/maxYlabels;
        step = Math.pow(10.0, 1+Math.floor(Math.log(step)/Math.log(10.0)));
        if(dataheight/step<maxYlabels/2) {
            step/=2;
        }    
        let ret : any[] = [];
        for(let y = (1+Math.floor(miny/step))*step;y<maxy;y+=step) {
            ret.push([y,chartBottom-((y-miny)*viewHeight/dataheight)]);
        }
        return ret;
    }

    private createRightChartYLabels() : any[] {
        let miny = this.dataRightScaleMinY;
        let maxy = this.dataRightScaleMaxY;
        let dataheight = maxy-miny;
        let chartBottom = this.getChartBoxBottom();
        let viewHeight = chartBottom-this.chartBoxTop;
        let maxYlabels = viewHeight / 20; // Min 20 pixels between y labels
        let step = dataheight/maxYlabels;
        step = Math.pow(10.0, 1+Math.floor(Math.log(step)/Math.log(10.0)));
        if(dataheight/step<maxYlabels/2) {
            step/=2;
        }    
        let ret : any[] = [];
        for(let y = (1+Math.floor(miny/step))*step;y<maxy;y+=step) {
            ret.push([y,chartBottom-((y-miny)*viewHeight/dataheight)]);
        }
        return ret;
    }

    
    public updateScaledDataPoints() {
        if(!this.datapoints || this.datapoints.length===0) {
            return;
        }        
       
        let minx = this.horizNavLeft;
        let width = this.horizNavRight-minx;
        let viewLeft = this.chartBoxLeft;
        let viewWidth = this.chartBoxRight-viewLeft;
        let chartBottom = this.getChartBoxBottom();
        let viewHeight = chartBottom-this.chartBoxTop;

        let minimums : number[] = []; // minimum values for multiple scales
        let maximums : number[] = [];   // maximum values for multiple scales
        let scaledY = (row : number[],colIndex : number,scaleIndex : number) => 
            chartBottom-((row[colIndex]-minimums[scaleIndex])*viewHeight/
            (maximums[scaleIndex]-minimums[scaleIndex]));

        this.scaledDataPoints = this.datapoints
            .filter((d)=>d[0]>=this.horizNavLeft)
            .filter((d)=>d[0]<=this.horizNavRight)    
            .map((row) => {      

                const findMinMax = (colIndex : number,scaleIndex : number) => {
                    // Find min && max for given column index and scale index
                    if(!minimums[scaleIndex] || row[colIndex]<minimums[scaleIndex]) {
                        minimums[scaleIndex] = row[colIndex]-1;
                    }
                    if(!maximums[scaleIndex] || row[colIndex]>maximums[scaleIndex]) {
                        maximums[scaleIndex] = row[colIndex]+1;
                    }
                };
                  
                findMinMax(1,0);
                findMinMax(2,1);
                findMinMax(3,1);
                findMinMax(4,1);
                return row;
            })        
            .reduce((prev : Array<any>,curr : any,ndx,arr) =>                 
                // Reduce number of visible points and show only min / max values in range
                prev.length>0 && 
                    ((curr[0]-minx)*viewWidth/width)
                    -((prev[prev.length-1][0]-minx)*viewWidth/width) < SPACE_BETWEEN_POINTS &&
                    curr[1]!==minimums[0] &&
                    curr[1]!==maximums[0] &&
                    ndx<arr.length-1
                    ? 
                        prev : 
                        prev.concat([curr])
                ,[]
            )
            .map((row : any,ndx : number,arr : any) => 
                [
                viewLeft+((row[0]-minx)*viewWidth/width), // scaled x                
                row[0], // original x
                scaledY(row,1,0), // scaled y
                row[1], // original y
                scaledY(row,2,1), // scaled y (scale2)
                row[2], // original y
                scaledY(row,3,1), // scaled y (scale2)
                row[3], // original y
                scaledY(row,4,1), // scaled y (scale2)
                row[4], // original y
                ]             
        );
        
        this.dataMinY = minimums[0];
        this.dataMaxY = maximums[0];
        this.dataRightScaleMinY = minimums[1];
        this.dataRightScaleMaxY = maximums[1];

        if(this.scaledDataPoints.length>0) {            
            this.chartYLabels = this.createChartYLabels();   
            this.chartYLabelsRight = this.createRightChartYLabels();
            
            const createPathString = (colIndex : number) => {
                let pathString = "M"+this.scaledDataPoints[0][0]+" "+this.scaledDataPoints[0][colIndex];
                for(let n=1;n<this.scaledDataPoints.length;n++) {
                    pathString+=" L"+this.scaledDataPoints[n][0]+" "+this.scaledDataPoints[n][colIndex];
                }
                return pathString;
            };
            
            
            this.pathStrings[0] = createPathString(2);
            
            // Scale 2 curves
            this.pathStrings[1] = createPathString(4);
            this.pathStrings[2] = createPathString(6);
            this.pathStrings[3] = createPathString(8);                                    

        } else {
            this.chartYLabels = [];            
        }
        this.updateChartXLabels();
        if(this.hoverOpacity===1 && this.lastTouchHoverX) {
            this.updateHover(this.lastTouchHoverX);
        }
    }        
} 