import { Component, OnInit, ViewChild } from '@angular/core';
import { QlyzeService } from './qlyze.service';
import { AnimationFrameThrottler, CanvasTableSelectListener, CanvasTableColumn, CanvasTableContainerComponent, CanvasTableComponent } from '../canvastable/canvastable.module';
import { ThematicArea } from '../dac/thematicarea.class';
export class ThematicAreaGroup {
    constructor(public groupName : string,
        public lastYear: number = 3000,        
        public thematicAreas : ThematicArea[]) {
        
    }
}
@Component({
    moduleId: "./app/qlyze/",
    templateUrl: 'qlyze-table.component.html'
})
export class QlyzeTableComponent implements CanvasTableSelectListener, OnInit {

    @ViewChild(CanvasTableContainerComponent) canvastablecontainer: CanvasTableContainerComponent;
    canvastable: CanvasTableComponent;
    thematicAreas: ThematicArea[] = []
    datapoints: any[] = []

    constructor(dataservice: QlyzeService) {
        this.datapoints = []
        dataservice.qlyzedata.forEach(item => {
            this.datapoints.push([item.name ? item.name : item.ticker, item.totalScore, item.rsiScore, item.seasonalityScore, item.rocScore, item.volScore])
        }); // Clone array
        this.rowdata = this.datapoints
        this.thematicAreas.push(
            new ThematicArea(1,"Health","",1999,2099,[]),
            new ThematicArea(2,"Education","",1999,2099,[]),
            new ThematicArea(3,"Civil society","",1999,2099,[]),
            new ThematicArea(4,"Peaceful coexistence","",1999,2099,[]),
            new ThematicArea(5,"Economic empowerment","",1999,2099,[]),
            new ThematicArea(6,"Human rights","",1999,2099,[]),
            new ThematicArea(7,"Gender equality","",1999,2099,[]),
        );
        console.log("thematicAreas = ", this.thematicAreas[1])
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
                getFormattedValue: (val) => val.toLocaleString(undefined, { minimumFractionDigits: 2 }),
                width: 100,
                sortColumn: 1
            },
            {
                name: "RSI",
                getValue: (r) => r[2],
                getFormattedValue: (val) => val.toLocaleString(undefined, { minimumFractionDigits: 2 }),
                width: 100,
                sortColumn: 2
            },
            {
                name: "Seasonality",
                getValue: (r) => r[3],
                getFormattedValue: (val) => val.toLocaleString(undefined, { minimumFractionDigits: 2 }),
                width: 100,
                sortColumn: 3
            },
            {
                name: "Momentum",
                getValue: (r) => r[4],
                getFormattedValue: (val) => val.toLocaleString(undefined, { minimumFractionDigits: 2 }),
                width: 100,
                sortColumn: 4
            },
            {
                name: "Volume",
                getValue: (r) => r[5],
                getFormattedValue: (val) => val.toLocaleString(undefined, { minimumFractionDigits: 2 }),
                width: 100,
                sortColumn: 5
            }
        ];

        this.canvastable.rows = this.datapoints;
        this.sortColumn()
    }

    sortColumn() {
        let sortcol = this.canvastablecontainer.sortColumn;
        console.log("sortcol = ", sortcol)
        if (sortcol > 0) {
            if (this.canvastablecontainer.sortDescending) {
                this.canvastable.rows = this.datapoints.sort((a, b) => a[sortcol] - b[sortcol]);
            } else {
                this.canvastable.rows = this.datapoints.sort((a, b) => b[sortcol] - a[sortcol]);
            }
        } else {
            let getValue: (rowobj: any) => string = this.canvastable.columns[sortcol].getValue;
            let compareFunction: (a: any, b: any) => number =
                this.canvastable.columns[sortcol].compareValue ?
                    this.canvastable.columns[sortcol].compareValue :
                    (a: any, b: any) => ("" + a).localeCompare(b);

            if (this.canvastablecontainer.sortDescending) {
                this.canvastable.rows.sort((a: any, b: any) =>
                    compareFunction(getValue(a), getValue(b))
                );
            } else {
                this.canvastable.rows.sort((a: any, b: any) =>
                    compareFunction(getValue(b), getValue(a))
                );
            }
        }
        this.canvastable.hasChanges = true;
    }

    rowSelected(rowIndex: number, colIndex: number, rowContent: any) {

    }

    isSelectedRow(rowObj: any) {
        return false;
    }

    isBoldRow(rowObj: any) {
        return false;
    }
    _rowdata: any[] = [];

    private set rowdata(rowdata: any[]) {
        this._rowdata = rowdata;
        this.updateCanvasTableData();
    }

    private get rowdata() {
        return this._rowdata;
    }

    _searchtext: string = "";
    public get searchtext() {
        return this._searchtext;
    }

    public set searchtext(searchtext: string) {
        if (searchtext !== this._searchtext) {
            this._searchtext = searchtext;
            new AnimationFrameThrottler("searchtextchange",
                () => this.updateCanvasTableData());
        }
    }
    showUsedRowsOnly = false;
    public updateCanvasTableData() {
        try {


            let searchex = new RegExp(this.searchtext,
                this.searchtext.search(/[A-Z0-9]/) > -1 ? "" : "i");

            let filteredRows = this.rowdata;

            if (this.searchtext && this.searchtext.trim().length > 0) {
                filteredRows = filteredRows.filter((row) =>
                    Object.keys(row)
                        .find((key) =>
                            row[key] &&
                            ("" + row[key]).search &&
                            ("" + row[key]).search(searchex) > -1
                        )
                );
            }
            
            if (this.showUsedRowsOnly) {
                filteredRows = filteredRows.filter((row) => 
                    Object.keys(row.thematicAreaMap)
                        .reduce((prev,thematicAreaKey) => 
                            prev || (row.thematicAreaMap[thematicAreaKey] &&
                            this.selectedThematicAreaIds[thematicAreaKey])
                            ,false)
                )
            } 

            this.canvastable.rows = filteredRows;

            this.sortColumn();
            this.canvastable.topindex = 0;
        } catch (e) {
            console.log(e);
        }
    }
        
    selectedThematicAreaIds : {[key : number] : boolean} = {};
    
    thematicAreaGroups : ThematicAreaGroup[] = [];
    
    refreshTableColumns() {  
        let colIndex : number = 0; 
        let colFunc = ( name : string, 
                        propName : string, 
                        width : number=100,
                        backgroundColor : string="#fff",
                        getValue = (rowobj : any) : any => rowobj[propName] ? rowobj[propName] : "",
                        setValue? : (rowobj : any,val : any) => void
                    ): CanvasTableColumn => {
            let ret = {
                name : name,
                width: this.canvastable.columns[colIndex] ? this.canvastable.columns[colIndex].width : width,
                sortColumn: colIndex,                                  
                getValue: getValue,
                setValue: setValue,
                checkbox: setValue ? true : false,
                tooltipText: setValue ? "Click to toggle DAC sector for thematic area": null,                
                backgroundColor: backgroundColor
            };
            colIndex++;
            return ret;
        };
        
        let columns : CanvasTableColumn[] = [ 
            colFunc("Name","name"),
            colFunc("Total","total")
        ];
        /*
        this.thematicAreaGroups.forEach((tag) => 
            tag.thematicAreas
                .filter((ta) => this.selectedThematicAreaIds[ta.id])
                .forEach((ta) => columns.push(
                    colFunc(ta.name,
                        undefined,
                        undefined,
                        "#FF5722",
                        (rowobj: any): any => rowobj.thematicAreaMap[ta.id],
                        (rowobj: any, val: boolean) => 
                            this.dacservice.setDacSectorStateForThematicArea(ta,rowobj,val)
                    )
                )
            )            
        ); */
        
        this.canvastable.columns = columns;
    }
}