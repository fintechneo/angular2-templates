import { Component,Input,ViewChild,OnInit,AfterViewInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: "svg-linechart",
    template: `
    <style>
        svg text {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            cursor: default;
        }
        svg text::selection {
            background: none;
        }
        .dragHandle:hover {
            fill: #0050a7;
            cursor: pointer;
        } 
    </style>
    
    <svg #svgelement [attr.viewBox]="getViewbox()"  
            preserveAspectRatio="none"
            style="width: 100%; height: 100%"          
            >                
        
        <!-- Y axis line -->
        <line 
            [attr.x1]="chartBoxLeft" 
            [attr.x2]="chartBoxLeft"
            [attr.y1]="getChartBoxTop()"            
            [attr.y2]="getChartBoxBottom()" 
            stroke="#000"
            stroke-width="1"></line>
                
        <!-- X axis line -->
        <line   
            [attr.x1]="chartBoxLeft" 
            [attr.x2]="getChartBoxRight()"
            [attr.y1]="getChartBoxBottom()"            
            [attr.y2]="getChartBoxBottom()" 
            stroke="#000"
            stroke-width="1"
            ></line>
        
        <!-- X axis navigator line -->

        <line   
            [attr.x1]="chartBoxLeft" 
            [attr.x2]="getChartBoxRight()"
            [attr.y1]="getChartHorizNavY()"            
            [attr.y2]="getChartHorizNavY()" 
            stroke="#000"
            stroke-width="1"
            ></line>

        
        <circle [attr.cx]="getChartHorizNavLeft()" [attr.cy]="getChartHorizNavY()" 
            r="15" 
            stroke="#000"
            stroke-width="1"
            fill="#fff"
            (mousedown)="dragHorizNavLeft($event)"
            (touchstart)="dragHorizNavLeft($event)"
            class="dragHandle"
            >
        </circle>

        <circle [attr.cx]="getChartHorizNavRight()" [attr.cy]="getChartHorizNavY()" 
            r="15" 
            stroke="#000"
            stroke-width="1"
            fill="#fff"
            (mousedown)="dragHorizNavRight($event)"
            (touchstart)="dragHorizNavRight($event)"
            class="dragHandle"
            >
        </circle>
        
        <!-- X axis labels -->

        <g class="labels x-labels">
            <text text-anchor="middle" [attr.x]="p[0]" [attr.y]="getChartBoxBottom()+20" *ngFor="let p of getChartXLabels()">
                {{p[2]}}
            </text>        
        </g>
        <g class="labels y-labels">
        <text alignment-baseline="middle" x="10" [attr.y]="yl[1]" *ngFor="let yl of getChartYLabels()">{{yl[0]}}</text>        
        </g>
        <g class="data" data-setname="Our first data set">
        <template ngFor let-p [ngForOf]="getScaledDataPoints()">
            <circle [attr.cx]="p[0]" [attr.cy]="p[1]" [attr.data-value]="p[1]" r="2"></circle>
            <line *ngIf="p[2] && p[3]" 
            [attr.x1]="p[2]" 
            [attr.y1]="p[3]"
            [attr.x2]="p[0]"  
            [attr.y2]="p[1]" 
            fill="none"
            stroke="#0074d9"
            stroke-width="1"></line>
            </template>
        </g>
    </svg>
    `
})
export class SVGLineChartComponent implements AfterViewInit,OnInit {
    _datapoints : any[] = [];
    mouseMoveSubject : Subject<any> = new Subject();
    mouseUpSubject : Subject<any> = new Subject();
    viewChangeSubject : Subject<any> = new Subject();

    public chartBoxLeft : number = 50;
    public svgLeft : number;

    width : number;
    height : number;

    @ViewChild("svgelement") svgElm : any;
   
   constructor() {

   }

   public recalculateBounds() {
       let bounds : any = this.svgElm.nativeElement.getBoundingClientRect();
       this.width = bounds.width;
       this.height = bounds.height;
       this.svgLeft = bounds.left;
   }

   ngOnInit() {
       this.recalculateBounds();       
   }

   ngAfterViewInit() {
       new Observable<any>((observer : Subscriber<any>) =>
        window.addEventListener("resize",() =>            
           observer.next()
        )
       ).subscribe(() => this.recalculateBounds());

       new Observable<any>((observer : Subscriber<any>) =>
        {
            this.svgElm.nativeElement.addEventListener("mousemove",(evt : any) =>  {  
                    evt.preventDefault();                           
                    observer.next({clientX: evt.clientX,clientY: evt.clientY});                    
                }
            );
            this.svgElm.nativeElement.addEventListener("touchmove",(evt : any) => {
                    evt.preventDefault();
                    observer.next(
                        {clientX: evt.targetTouches[0].clientX,
                        clientY: evt.targetTouches[0].clientY
                            });
                }
            );
        }
       ).subscribe(this.mouseMoveSubject);
       
       new Observable<any>((observer : Subscriber<any>) => {
            this.svgElm.nativeElement.addEventListener("mouseup",(evt : any) => {
                evt.preventDefault();
                observer.next(evt);
            });
            this.svgElm.nativeElement.addEventListener("touchend",(evt : any) => {
                evt.preventDefault();
                observer.next(evt);
            });
        }
       ).subscribe(this.mouseUpSubject);       
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

   public get datapoints() : any[] {
       return this._datapoints;
   }
   
    /** 
     * Get viewbox based on element width / height
     */
    public getViewbox() : string {           
        return "0 0 "+
            this.width+" "+
            this.height;
    }

    // ----------- X axis navigator functions

    public horizNavLeft : number;
    public horizNavRight : number;
        
    public getFirstVisibleValue() : number {
        return this.datapoints
            .find((d : any)=>d[0]>=this.horizNavLeft)[1];            
    }

    public getLastVisibleValue() : number {
        return this.datapoints            
            .reduceRight((prev : any, d : any)=>
                !prev && d[0]<=this.horizNavRight ? d : prev 
                ,null)[1];         
    }

    public getChartHorizNavY() : number {
        return this.height-20;
    }

    public getChartHorizNavLeft() : number {
        let minx = this.getDataMinX();
        let width = this.getDataWidth();
        let viewLeft = this.chartBoxLeft;
        let viewWidth = this.getChartBoxRight()-viewLeft;
        return viewLeft+((this.horizNavLeft-minx)*viewWidth/width)
    }

    public getChartHorizNavRight() : number {
        let minx = this.getDataMinX();
        let width = this.getDataWidth();
        let viewLeft = this.chartBoxLeft;
        let viewWidth = this.getChartBoxRight()-viewLeft;
        return viewLeft+((this.horizNavRight-minx)*viewWidth/width)
    }

    public dragHorizNavLeft(evt : Event) {
        evt.preventDefault();
        let minx = this.getDataMinX();
        let width = this.getDataWidth();
        let viewLeft = this.chartBoxLeft;
        let viewWidth = this.getChartBoxRight()-viewLeft;
        

        let movesubscription = this.mouseMoveSubject
            .map((evt) => evt.clientX-this.svgLeft-viewLeft)
            .filter((clientx) => clientx>=0)  
            .filter((clientx) => clientx+viewLeft<this.getChartHorizNavRight()-30)                      
            .map((clientx : number) => minx+((clientx)/viewWidth)*this.getDataWidth())            
            .subscribe((d : number) => this.horizNavLeft = d);

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
        let viewWidth = this.getChartBoxRight()-viewLeft;        

        let movesubscription = this.mouseMoveSubject
            .map((evt) => evt.clientX-this.svgLeft-viewLeft)
            .filter((clientx) => clientx<=viewWidth)
            .filter((clientx) => 
                    clientx+viewLeft>this.getChartHorizNavLeft()+30
                    )
            .map((clientx : number) => 
                minx+((clientx
                )/viewWidth)*this.getDataWidth()
            )           
            .subscribe((d : number) => this.horizNavRight = d);
        let upsubscription = this.mouseUpSubject.subscribe((evt : any) => {
            movesubscription.unsubscribe();
            upsubscription.unsubscribe();            
        });
    }

    // ------------ Chart box functions


    public getChartBoxRight() {
        return this.width-40;
    }
    
    public getChartBoxTop() {
        return 5;
    }

    public getChartBoxBottom() {
        return this.getChartHorizNavY()-60;
    }


    public getDataMinX() : number {
        return this.datapoints[0][0];
    }

    public getDataWidth() : number {
        return this.datapoints[this.datapoints.length-1][0]
                    -this.datapoints[0][0];
    }

    public getDataMinY() : number {
        return this.datapoints
            .filter((d : any)=>d[0]>=this.horizNavLeft)
            .filter((d : any)=>d[0]<=this.horizNavRight)
            .reduce((prev,curr) => curr[1]<prev ? curr[1] : prev,this.datapoints[0][1])
    }

    public getDataMaxY() : number {
        return this.datapoints
            .filter((d : any)=>d[0]>=this.horizNavLeft)
            .filter((d : any)=>d[0]<=this.horizNavRight)
            .reduce((prev,curr) => curr[1]>prev ? curr[1] : prev,this.datapoints[0][1])
    }

    public getChartXLabels() : any[] {
        let minx = this.horizNavLeft;
        let width = this.horizNavRight-minx;
        let viewLeft = this.chartBoxLeft;
        let viewWidth = this.getChartBoxRight()-viewLeft;

        return this.datapoints
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

    public getChartYLabels() : any[] {
        let miny = this.getDataMinY();
        let maxy = this.getDataMaxY();
        let dataheight = maxy-miny;
        let chartBottom = this.getChartBoxBottom();
        let viewHeight = chartBottom-this.getChartBoxTop();
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

    public getScaledDataPoints() : any[] {
        let minx = this.horizNavLeft;
        let width = this.horizNavRight-minx;
        let viewLeft = this.chartBoxLeft;
        let viewWidth = this.getChartBoxRight()-viewLeft;
        let miny = this.getDataMinY();
        let maxy = this.getDataMaxY();
        let dataheight = maxy-miny;
        let chartBottom = this.getChartBoxBottom();
        let viewHeight = chartBottom-this.getChartBoxTop();
        
        return this.datapoints
            .filter((d)=>d[0]>=this.horizNavLeft)
            .filter((d)=>d[0]<=this.horizNavRight)
            .reduce((prev : Array<any>,curr : any) =>
                    prev.length>0 && 
                    ((curr[0]-minx)*viewWidth/width)
                    -((prev[prev.length-1][0]-minx)*viewWidth/width) < 10 ? 
                        prev : 
                        prev.concat([curr])
                    ,[])
            .map((d : any,ndx : number,arr : any) => 
                [
                viewLeft+((d[0]-minx)*viewWidth/width), // scaled x
                chartBottom-((d[1]-miny)*viewHeight/dataheight), // scaled y
                ndx>0 ? viewLeft+((arr[ndx-1][0]-minx)*viewWidth/width) : null, // scaled x previous (for lines)
                ndx>0 ? chartBottom-((arr[ndx-1][1]-miny)*viewHeight/dataheight) : null, // scaled y previous (for lines)
                d[0], // original x
                d[1] // original y
                ]             
        );
    }
    
    
} 