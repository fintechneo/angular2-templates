import { Component,OnInit,ViewChild } from '@angular/core';
import { CanvasTableSelectListener,CanvasTableContainerComponent,CanvasTableComponent,CanvasTableColumn} from '../canvastable/canvastable.module';
import { QlyzeService } from './qlyze.service';

@Component({   
    moduleId: "./app/qlyze/", 
    templateUrl: 'qlyze-table.component.html'
})
export class QlyzeTableComponent implements CanvasTableSelectListener, OnInit {

    @ViewChild(CanvasTableContainerComponent) canvastablecontainer : CanvasTableContainerComponent;
    canvastable : CanvasTableComponent;
    
    datapoints : any[];

    constructor(dataservice : QlyzeService) {
        this.datapoints = []
        dataservice.qlyzedata.forEach(item => {
        this.datapoints.push([item.name, item.totalScore, item.rsiScore, item.seasonalityScore, item.rocScore, item.volScore])
        }); // Clone array
    }

    ngOnInit() {
        this.canvastable = this.canvastablecontainer.canvastable;
        this.canvastable.columns = [
            {
                name: "Name",
                getValue: (r) => r[0],
                getFormattedValue: (val) => val,
                width: 200,
                sortColumn: 0
            },
            {
                name: "Total",
                getValue: (r) => r[1],
                getFormattedValue: (val) => val.toLocaleString(undefined,{minimumFractionDigits: 2}),
                width: 100,
                sortColumn: 1
            },
            {
                name: "RSI",
                getValue: (r) => r[2],
                getFormattedValue: (val) => val.toLocaleString(undefined,{minimumFractionDigits: 2}),
                width: 100,
                sortColumn: 2
            },
            {
                name: "Seasonality",
                getValue: (r) => r[3],
                getFormattedValue: (val) => val.toLocaleString(undefined,{minimumFractionDigits: 2}),
                width: 100,
                sortColumn: 3
            },
            {
                name: "Momentum",
                getValue: (r) => r[4],
                getFormattedValue: (val) => val.toLocaleString(undefined,{minimumFractionDigits: 2}),
                width: 100,
                sortColumn: 4
            },
            {
                name: "Volume",
                getValue: (r) => r[5],
                getFormattedValue: (val) => val.toLocaleString(undefined,{minimumFractionDigits: 2}),
                width: 100,
                sortColumn: 5
            }
        ]; 

        this.canvastable.rows = this.datapoints;
    }

    sortColumn() {
        let sortcol = this.canvastablecontainer.sortColumn;
        console.log("sortcol = ",sortcol)
        if(this.canvastablecontainer.sortDescending) {
            this.canvastable.rows = this.datapoints.sort((a,b) => a[sortcol]-b[sortcol]);                
        } else {
            this.canvastable.rows = this.datapoints.sort((a,b) => b[sortcol]-a[sortcol]);                
        }        
        this.canvastable.hasChanges = true;
    }

    rowSelected(rowIndex : number, colIndex : number,rowContent: any) {

    }

    isSelectedRow(rowObj : any) {
        return false;
    }

    isBoldRow(rowObj : any) {
        return false;
    }
}