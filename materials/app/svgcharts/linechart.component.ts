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
            <text text-anchor="middle" [attr.x]="p[0]" [attr.y]="getChartBoxBottom()+15" *ngFor="let p of getScaledDataPoints()">{{p[4]}}</text>        
        </g>
        <g class="labels y-labels">
        <text x="80" y="15">15</text>
        <text x="80" y="131">10</text>
        <text x="80" y="248">5</text>
        <text x="80" y="373">0</text>
        <text x="50" y="200" class="label-title">Price</text>
        </g>
        <g class="data" data-setname="Our first data set">
        <template ngFor let-p [ngForOf]="getScaledDataPoints()">
            <circle [attr.cx]="p[0]" [attr.cy]="p[1]" [attr.data-value]="p[1]" r="4"></circle>
            <line *ngIf="p[2] && p[3]" 
            [attr.x1]="p[2]" 
            [attr.y1]="p[3]"
            [attr.x2]="p[0]"  
            [attr.y2]="p[1]" 
            fill="none"
            stroke="#0074d9"
            stroke-width="3"></line>
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
        return this.svgElm.nativeElement.scrollWidth-10;
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

    public getChartXLabels() {

    } 

    public getChartYLabels() {

    }
    
    public getScaledDataPoints() : any[] {
        let minx = this.getDataMinX();
        let width = this.getDataWidth();
        let viewLeft = this.getChartBoxLeft();
        let viewWidth = this.getChartBoxRight()-viewLeft;
        let miny = this.datapoints.reduce((prev,curr) => curr[1]<prev ? curr[1] : prev,this.datapoints[0][1]);
        let maxy = this.datapoints.reduce((prev,curr) => curr[1]>prev ? curr[1] : prev,this.datapoints[0][1]);
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