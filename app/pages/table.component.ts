import { Component,OnInit,ViewChild } from '@angular/core';
import { CanvasTableSelectListener,CanvasTableContainerComponent,CanvasTableComponent,CanvasTableColumn} from '../canvastable/canvastable.module';
import { DataService } from '../data.service';

@Component({    
    template: `<div style="position: absolute; top: 65px; left: 0px; right: 0px; bottom: 0px;">
            <canvastablecontainer [canvastableselectlistener]="this" (sortToggled)="sortColumn()"></canvastablecontainer>
        </div>`
})
export class TableComponent implements CanvasTableSelectListener, OnInit {

    @ViewChild(CanvasTableContainerComponent) canvastablecontainer : CanvasTableContainerComponent;
    canvastable : CanvasTableComponent;
    
    datapoints : number[][];

    constructor(dataservice : DataService) {
        this.datapoints = dataservice.datapoints
            .map((dp) => dp); // Clone array
    }

    ngOnInit() {
        this.canvastable = this.canvastablecontainer.canvastable;
        this.canvastable.columns = [
            {
                name: "Date",
                getValue: (r) => r[0],
                getFormattedValue: (val) => new Date(val).toJSON().substr(0,"yyyy-MM-dd".length),
                width: 100,
                sortColumn: 0
            },
            {
                name: "Price",
                getValue: (r) => r[1],
                getFormattedValue: (val) => val.toLocaleString(undefined,{minimumFractionDigits: 2}),
                width: 200,
                textAlign: 1,
                sortColumn: 1
            }
        ]; 
        this.canvastable.rows = this.datapoints;
    }

    sortColumn() {
        let sortcol = this.canvastablecontainer.sortColumn;
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