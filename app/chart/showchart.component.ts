import { Component } from '@angular/core';
import { SINTEFMeasureStationService } from './measurestation/measurestation.service';
import { LineChartConfig } from './linechart.component';

@Component({
    moduleId: "app/chart/",
    selector: "sintef-measurestation-app",
    templateUrl: "showchart.component.html"
})
export class ShowChartComponent {
    datapoints : number[][];

    lastUpdate : Date = new Date();

    title : string = "H"+String.fromCharCode(0xf8)+"vringen test site"
    legendItems: any[] = [
        {name: "Field 1",description: "Bluegrey w/Leca & Multiblokk",color: "#0D47A1"},
        {name: "Field 2",description: "Reference w/black roofing",color: "#F44336"},
        {name: "Field 3",description: "Reference w/Bluegreen sedum roofing",color: "#43A047"}

    ];

    lineChartConfig : LineChartConfig = {
        leftUnit: String.fromCharCode(0x00B0)+"C",
        rightUnit: "mm",
        lines: [
            {
                    color: "#FFC107",
                    columnIndex: 0,
                    scaleIndex: 0,
                    unit: String.fromCharCode(0x00B0)+"C"
            },
            {
                    color: this.legendItems[0].color,
                    columnIndex: 1,
                    scaleIndex: 1,
                    unit: "mm"
            },
            {
                    color: this.legendItems[1].color,
                    columnIndex: 2,
                    scaleIndex: 1,
                    unit: "mm"
            },
            {
                    color: this.legendItems[2].color,
                    columnIndex: 3,
                    scaleIndex: 1,
                    unit: "mm"
            }
        ]
    };

    constructor(public measureStationService : SINTEFMeasureStationService) {
        this.measureStationService.getMeasureStationData()
            .subscribe((res) => 
                this.datapoints = res.map((row : any) => [
                    row.timestamp.getTime(),
                    row.temperature,                    
                    row.precipitation1,
                    row.precipitation2,
                    row.precipitation3              
                ]
                )
            );
    }


}