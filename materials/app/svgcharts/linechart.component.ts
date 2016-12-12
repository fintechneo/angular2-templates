import { Component,Input,ViewChild,AfterViewInit,ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: "svg-linechart",
    template: `
    <div style="width: 100%; height: 100%; border: red solid 1px">
    <svg #svgelement [attr.viewBox]="getViewbox()" preserveAspectRatio="none">                
        
        <!-- Y axis line -->
        <line 
            [attr.x1]="getChartBoxLeft()" 
            [attr.x2]="getChartBoxLeft()"
            [attr.y1]="getChartBoxTop()"            
            [attr.y2]="getChartBoxBottom()" 
            stroke="#000"
            stroke-width="1"></line>
                
        <!-- X axis line -->
        <line   
            [attr.x1]="getChartBoxLeft()" 
            [attr.x2]="getChartBoxRight()"
            [attr.y1]="getChartBoxBottom()"            
            [attr.y2]="getChartBoxBottom()" 
            stroke="#000"
            stroke-width="1"
            ></line>
        
        <!-- X axis navigator line -->

        <line   
            [attr.x1]="getChartBoxLeft()" 
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
            fill-opacity="0"
            (mousedown)="dragHorizNavLeft()"
            >
        </circle>

        <circle [attr.cx]="getChartHorizNavRight()" [attr.cy]="getChartHorizNavY()" 
            r="15" 
            stroke="#000"
            stroke-width="1"
            fill-opacity="0"
            (mousedown)="dragHorizNavRight()"
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
    </div>`
})
export class SVGLineChartComponent implements AfterViewInit {
    _datapoints : any[] = [];
    mouseMoveSubject : Subject<any> = new Subject();
    mouseUpSubject : Subject<any> = new Subject();

    @ViewChild("svgelement") svgElm : any;
   
   constructor(private ref: ChangeDetectorRef) {

   }


   ngAfterViewInit() {
       window.addEventListener("resize",() =>            
           this.ref.detectChanges()
       );
       new Observable<any>((observer : Subscriber) =>
            window.addEventListener("mousemove",(evt) =>
                observer.next(evt)
       )).subscribe(this.mouseMoveSubject);
       
       new Observable<any>((observer : Subscriber) =>
            window.addEventListener("mouseup",(evt) =>
                observer.next(evt)
       )).subscribe(this.mouseUpSubject);
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

    public getNativeElement() {
        return this.svgElm.nativeElement;
    }

    /** 
     * Get viewbox based on element width / height
     */
    public getViewbox() : string {    
        return "0 0 "+this.svgElm.nativeElement.scrollWidth+" "+this.svgElm.nativeElement.scrollHeight;
    }

    // ----------- X axis navigator functions

    public horizNavLeft : number;
    public horizNavRight : number;
        
    public getChartHorizNavY() : number {
        return this.svgElm.nativeElement.scrollHeight-30;
    }

    public getChartHorizNavLeft() : number {
        let minx = this.getDataMinX();
        let width = this.getDataWidth();
        let viewLeft = this.getChartBoxLeft();
        let viewWidth = this.getChartBoxRight()-viewLeft;
        return viewLeft+((this.horizNavLeft-minx)*viewWidth/width)
    }

    public getChartHorizNavRight() : number {
        let minx = this.getDataMinX();
        let width = this.getDataWidth();
        let viewLeft = this.getChartBoxLeft();
        let viewWidth = this.getChartBoxRight()-viewLeft;
        return viewLeft+((this.horizNavRight-minx)*viewWidth/width)
    }

    public dragHorizNavLeft() {
        let minx = this.getDataMinX();
        let width = this.getDataWidth();
        let viewLeft = this.getChartBoxLeft();
        let viewWidth = this.getChartBoxRight()-viewLeft;
        let svgLeft = this.svgElm.nativeElement.getBoundingClientRect().left;

        let movesubscription = this.mouseMoveSubject
            .map((evt : any) => minx+((evt.clientX-
                viewLeft-
                svgLeft)/viewWidth)*this.getDataWidth())
            .filter((d : number) => d<this.horizNavRight)
            .filter((d : number) => d>=minx)
            .subscribe((d : number) => this.horizNavLeft = d);

        let upsubscription = this.mouseUpSubject.subscribe((evt : any) => {
            movesubscription.unsubscribe();
            upsubscription.unsubscribe();
        });
    }

    public dragHorizNavRight() {
        let minx = this.getDataMinX();
        let width = this.getDataWidth();
        let viewLeft = this.getChartBoxLeft();
        let viewWidth = this.getChartBoxRight()-viewLeft;
        let svgLeft = this.svgElm.nativeElement.getBoundingClientRect().left;

        let movesubscription = this.mouseMoveSubject
            .map((evt : any) => 
                minx+((evt.clientX-
                viewLeft-
                svgLeft)/viewWidth)*this.getDataWidth()
            )
            .filter((d : number) => d<=minx+width)
            .filter((d : number) => d>this.horizNavLeft)
            .subscribe((d : number) => this.horizNavRight = d);
        let upsubscription = this.mouseUpSubject.subscribe((evt : any) => {
            movesubscription.unsubscribe();
            upsubscription.unsubscribe();
        });
    }

    // ------------ Chart box functions
    public getChartBoxLeft() {
        return 50;
    }

    public getChartBoxRight() {
        return this.svgElm.nativeElement.scrollWidth-40;
    }
    
    public getChartBoxTop() {
        return 5;
    }

    public getChartBoxBottom() {
        return this.getChartHorizNavY()-50;
    }


    public getDataMinX() : number {
        return this.datapoints[0][0];
    }

    public getDataWidth() : number {
        return this.datapoints[this.datapoints.length-1][0]
                    -this.datapoints[0][0];
    }

    public getDataMinY() : number {
        return this.datapoints.reduce((prev,curr) => curr[1]<prev ? curr[1] : prev,this.datapoints[0][1])
    }

    public getDataMaxY() : number {
        return this.datapoints.reduce((prev,curr) => curr[1]>prev ? curr[1] : prev,this.datapoints[0][1])
    }

    public getChartXLabels() : any[] {
        let minx = this.getDataMinX();
        let width = this.getDataWidth();
        let viewLeft = this.getChartBoxLeft();
        let viewWidth = this.getChartBoxRight()-viewLeft;

        return this.datapoints.reduce((prev,d) =>
            prev.length>0 && viewLeft+((d[0]-minx)*viewWidth/width)-prev[prev.length-1][0] < 100 ? prev : 
                prev.concat([[viewLeft+((d[0]-minx)*viewWidth/width),d[0],new Date(d[0]).toJSON().substr(0,"yyyy-MM".length)]])
            ,
            []);
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
        let viewLeft = this.getChartBoxLeft();
        let viewWidth = this.getChartBoxRight()-viewLeft;
        let miny = this.getDataMinY();
        let maxy = this.getDataMaxY();
        let dataheight = maxy-miny;
        let chartBottom = this.getChartBoxBottom();
        let viewHeight = chartBottom-this.getChartBoxTop();
        
        return this.datapoints
            .filter((d)=>d[0]>=minx)
            .filter((d)=>d[0]<=this.horizNavRight)
            .map((d,ndx,arr) => 
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