import { Component,Input,ViewChild,AfterViewInit,ChangeDetectorRef } from '@angular/core';

@Component({
    selector: "svg-linechart",
    template: `
    <div style="width: 100%; height: 100%; border: red solid 1px">
    <svg #svgelement [attr.viewBox]="getViewbox()" preserveAspectRatio="none">                
        
        <line 
            [attr.x1]="getChartBoxLeft()" 
            [attr.x2]="getChartBoxLeft()"
            [attr.y1]="getChartBoxTop()"            
            [attr.y2]="getChartBoxBottom()" 
            stroke="#000"
            stroke-width="1"></line>
                
        <line   
            [attr.x1]="getChartBoxLeft()" 
            [attr.x2]="getChartBoxRight()"
            [attr.y1]="getChartBoxBottom()"            
            [attr.y2]="getChartBoxBottom()" 
            stroke="#000"
            stroke-width="1"
            ></line>
        

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
    @Input() datapoints : any[] = [];

    @ViewChild("svgelement") svgElm : any;
   
   constructor(private ref: ChangeDetectorRef) {

   }

   ngAfterViewInit() {
       window.addEventListener("resize",() => {           
           this.ref.detectChanges();
       });
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
        return this.svgElm.nativeElement.scrollHeight-40;
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
        let minx = this.getDataMinX();
        let width = this.getDataWidth();
        let viewLeft = this.getChartBoxLeft();
        let viewWidth = this.getChartBoxRight()-viewLeft;
        let miny = this.getDataMinY();
        let maxy = this.getDataMaxY();
        let dataheight = maxy-miny;
        let chartBottom = this.getChartBoxBottom();
        let viewHeight = chartBottom-this.getChartBoxTop();
        
        return this.datapoints.map((d,ndx,arr) => 
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