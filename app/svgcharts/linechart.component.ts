import { Component,Input,ViewChild,OnInit,OnDestroy,AfterViewInit,DoCheck,Renderer2 } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/throttle';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

const SPACE_BETWEEN_POINTS : number = 5;    

@Component({
    moduleId: "app/svgcharts/",
    selector: "svg-linechart",
    templateUrl: 'linechart.component.html'
})
export class SVGLineChartComponent implements AfterViewInit,OnInit,OnDestroy,DoCheck {
    _datapoints : any[] = [];
    mouseMoveSubject : Subject<any> = new Subject();
    mouseUpSubject : Subject<any> = new Subject();
    viewChangeSubject : Subject<any> = new Subject();
    scaledDataPoints : any[] = [];

    chartYLabels : any[] = [];

    @Input() mode : string = "growth";
    @Input() xaxisnav : boolean = true;

    public chartBoxLeft : number = 50;
    public chartBoxRight : number = 200;

    public svgLeft : number;

    public firstVisibleValue : number;
    public lastVisibleValue : number;
    public zeropointcharty : number;
    public zeropoint : number;
    public netGrowth : number;

    public deposits : number;
    public withdrawals : number;

    public viewBox : string;

    hoverX : number;
    hoverXvalue : number;
    hoverYvalue : number;
    hoverTextY : number;
    hoverPt : number[];

    chartXLabels : any[];    

    width : number;
    height : number;

    dataMinY : number;
    dataMaxY : number;

    chartBoxTop : number = 5;

    

    prevBounds : number[] = [0,0,500,500];
    
    @ViewChild("svgelement") svgElm : any;
   
    destroyTasks : (() => void)[] = []

    constructor(private renderer: Renderer2) {

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

   public handleHover(e : MouseEvent) {
        this.hoverX = e.offsetX;
        
        this.hoverPt = this.scaledDataPoints.find((arr) =>         
            this.hoverX<(arr[0]+SPACE_BETWEEN_POINTS/2));
        
        if(this.hoverPt) {
            this.hoverXvalue = this.hoverPt[4];
            this.hoverYvalue = this.hoverPt[6];
            this.hoverX = this.hoverPt[0];
            this.hoverTextY = this.hoverPt[1]+10;
            let bottom = this.getChartBoxBottom()-27;
            if(this.hoverTextY>bottom) {
                this.hoverTextY = bottom;
            }
        } else {
            this.hoverX = null;
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

        this.chartXLabels = this.datapoints
            .filter((d : any)=>d[0]>=this.horizNavLeft)
            .filter((d : any)=>d[0]<=this.horizNavRight)
            .reduce((prev : Array<any>,d : any) =>
                    prev.length>0 && viewLeft+
                    ((d[0]-minx)*viewWidth/width)
                    -prev[prev.length-1][0] < 100 ? 
                        prev : 
                        prev.concat(
                            [[viewLeft+((d[0]-minx)*viewWidth/width),d[0],
                            new Date(d[0]).toJSON().substr(0,"yyyy-MM".length)]]
                    )
                ,[]);        
    }

    private createChartYLabels() : any[] {
        let zeropoint = 0;
        if(this.mode==="growth") {
            zeropoint = this.firstVisibleValue;
        }
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
            ret.push([y-zeropoint,chartBottom-((y-miny)*viewHeight/dataheight)]);
        }
        this.zeropointcharty = chartBottom-(zeropoint-miny)*viewHeight/dataheight;
        this.zeropoint = zeropoint;
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
        
        let min : number;
        let max : number;

        let deposits = 0;
        let withdrawals = 0;
        this.scaledDataPoints = this.datapoints
            .filter((d)=>d[0]>=this.horizNavLeft)
            .filter((d)=>d[0]<=this.horizNavRight)    
            .map((d) => {
                // Adjustments (e.g. withdrawals or deposits)
                if(d[2]!==undefined) {          
                    let dw = d[2];   
                    if(dw>0) {
                        deposits+=dw;
                    } else {
                        withdrawals+=(-dw);
                    }                    
                }

                d = [d[0],d[1],d[2],d[1]+withdrawals-deposits];                    
                
                // Find min && max
                if(!min || d[3]<min) {
                    min = d[3]-1;
                }
                if(!max || d[3]>max) {
                    max = d[3]+1;
                }
                return d;
            })        
            .reduce((prev : Array<any>,curr : any,ndx,arr) =>                 
                prev.length>0 && 
                    ((curr[0]-minx)*viewWidth/width)
                    -((prev[prev.length-1][0]-minx)*viewWidth/width) < SPACE_BETWEEN_POINTS &&
                    curr[1]!==min &&
                    curr[1]!==max &&
                    ndx<arr.length-1
                    ? 
                        prev : 
                        prev.concat([curr])
                ,[]
            )
            .map((d : any,ndx : number,arr : any) => 
                [
                viewLeft+((d[0]-minx)*viewWidth/width), // scaled x
                chartBottom-((d[3]-min)*viewHeight/(max-min)), // scaled y
                ndx>0 ? viewLeft+((arr[ndx-1][0]-minx)*viewWidth/width) : null, // scaled x previous (for lines)
                ndx>0 ? chartBottom-((arr[ndx-1][3]-min)*viewHeight/(max-min)) : null, // scaled y previous (for lines)
                d[0], // original x
                d[1], // original y
                d[3] // adjusted y
                ]             
        );
        
        this.dataMinY = min;
        this.dataMaxY = max;
        
        this.deposits = deposits;
        this.withdrawals = withdrawals;
        if(this.scaledDataPoints.length>0) {
            this.firstVisibleValue = this.scaledDataPoints[0][5];
            this.lastVisibleValue = this.scaledDataPoints[this.scaledDataPoints.length-1][5];
            let lastAdjustedValue = this.scaledDataPoints[this.scaledDataPoints.length-1][6];
            this.netGrowth = lastAdjustedValue-this.firstVisibleValue;
            this.chartYLabels = this.createChartYLabels();            
        } else {
            this.firstVisibleValue = 0;
            this.lastVisibleValue = 0;
            this.netGrowth = 0;
            this.chartYLabels = [];            
        }
        this.updateChartXLabels();
    }        
} 