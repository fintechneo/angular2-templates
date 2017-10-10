/* 
 *  Copyright 2010-2016 FinTech Neo AS ( fintechneo.com )- All rights reserved
 */


import { Component,ViewChild,OnInit,DoCheck } from '@angular/core';
import { DACService, DACSocketUpdateMessage } from './dac.service';
import { ThematicArea } from './thematicarea.class';
import { AnimationFrameThrottler,CanvasTableSelectListener,CanvasTableColumn,CanvasTableContainerComponent,CanvasTableComponent } from '../canvastable/canvastable.module';

import { MatDialog,MatDialogRef } from '@angular/material';
import { DACSector, DACCodeListsService} from './daccodelists.service';

export class ThematicAreaGroup {
    constructor(public groupName : string,
        public lastYear: number = 3000,        
        public thematicAreas : ThematicArea[]) {
        
    }
}

@Component({
    moduleId: 'app/dac/',
    selector: "dac-admin",
    templateUrl: "dacadmin.component.html",
    providers: [DACService]
})
export class DACAdminComponent implements CanvasTableSelectListener,OnInit,DoCheck {
    
    @ViewChild(CanvasTableContainerComponent) canvastablecontainer : CanvasTableContainerComponent;
    canvastable : CanvasTableComponent;    
    
    dataReady : boolean;
        
    showUsedRowsOnly = false;
    
    selectedThematicAreaIds : {[key : number] : boolean} = {};
    
    thematicAreaGroups : ThematicAreaGroup[] = [];
    
    constructor(public dacservice : DACService,         
        public dialog : MatDialog,
        public daccodesservice : DACCodeListsService) {
                        
    }
    
    _rowdata : DACSector[] = [];
    
    private set rowdata(rowdata : DACSector[] ) {
        this._rowdata = rowdata;
        this.updateCanvasTableData();
    }
    
    private get rowdata() {
        return this._rowdata;
    }
    
     _searchtext : string = "";
    public get searchtext() {
        return this._searchtext;
    }
    
    public set searchtext(searchtext : string) {
        if (searchtext !== this._searchtext) {
            this._searchtext = searchtext;
            new AnimationFrameThrottler("searchtextchange", 
                        () => this.updateCanvasTableData());
        }
    }
    
    ngDoCheck() {
        
    }
    
    ngOnInit() {
        this.canvastable = this.canvastablecontainer.canvastable;
        this.canvastable.autoRowWrapModeWidth = 0; // No row wrapping
        this.daccodesservice.dacSectors.subscribe((dacsectors) => {                                              
            let byCode : {[code : number] : DACSector} = {};
            dacsectors.forEach((ds) => byCode[ds.code] = ds);
            
            this.dacservice.thematicAreas.subscribe((tareas) => {
                let byGroup : {[group : string] : ThematicArea[]} = {};
                tareas.forEach((ta) => {
                    if (!byGroup[ta.groupName]) {
                        byGroup[ta.groupName] = [];
                        this.thematicAreaGroups.push(
                            new ThematicAreaGroup(ta.groupName, ta.lastYear,byGroup[ta.groupName])
                        );
                    }
                    byGroup[ta.groupName].push(ta);
                    ta.dacSectorCodes.forEach((dscode) => {
                        if(byCode[dscode]) {
                            byCode[dscode].thematicAreaMap[ta.id] = true;
                        } else {
                            console.log("missing DAC code: "+dscode);
                        }
                    });
                    if (ta.dacSectorCodes.length>0) {
                        this.selectedThematicAreaIds[ta.id] = true;
                    }
                });            
                this.thematicAreaGroups.sort((a, b) => b.lastYear - a.lastYear);  
                this.refreshTableColumns();  
                this.rowdata = dacsectors;
                this.dataReady = true;

                this.dacservice.socketUpdates.filter(
                    (msg: DACSocketUpdateMessage) => msg && msg.methodname==="setDacSectorStateForThematicArea")
                    .subscribe((msg) => {
                        byCode[msg.params[1]].thematicAreaMap[msg.params[0]] = msg.params[2];
                        this.canvastable.hasChanges = true;
                });          
            });

        
        });
    }
    
    refreshTableColumns() {  
        let colIndex : number = 0; 
        let colFunc = ( name : string, 
                        propName : string, 
                        width : number=100,
                        backgroundColor : string="#fff",
                        getValue = (rowobj : DACSector) : any => rowobj[propName] ? rowobj[propName] : "",
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
            colFunc("Category","category"),
            colFunc("Code","code"),
            colFunc("Name","name"),
            colFunc("Description","description")
        ];
        
        this.thematicAreaGroups.forEach((tag) => 
            tag.thematicAreas
                .filter((ta) => this.selectedThematicAreaIds[ta.id])
                .forEach((ta) => columns.push(
                    colFunc(ta.name,
                        undefined,
                        undefined,
                        "#FF5722",
                        (rowobj: DACSector): any => rowobj.thematicAreaMap[ta.id],
                        (rowobj: DACSector, val: boolean) => 
                            this.dacservice.setDacSectorStateForThematicArea(ta,rowobj,val)
                    )
                )
            )            
        ); 
        
        this.canvastable.columns = columns;
    }
    
    public updateCanvasTableData() {        
        try {    
            
            
            let searchex = new RegExp(this.searchtext, 
                this.searchtext.search(/[A-Z0-9]/)>-1 ? "": "i");

            let filteredRows = this.rowdata;
            
            if (this.searchtext && this.searchtext.trim().length>0) {                          
                filteredRows = filteredRows.filter((row) => 
                    Object.keys(row)
                        .find((key) =>             
                        row[key] && 
                        (""+row[key]).search && 
                        (""+row[key]).search(searchex)>-1                                      
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
            
            this.sort(); 
            this.canvastable.topindex = 0;            
        } catch(e) {
            console.log(e);
        }
    }
    
    sort() {
        let column = this.canvastablecontainer.sortColumn;
        let getValue : (rowobj : any) => string = this.canvastable.columns[column].getValue;
        let compareFunction: (a: any, b: any) => number = 
            this.canvastable.columns[column].compareValue ? 
                this.canvastable.columns[column].compareValue :
                (a: any,b: any) => (""+a).localeCompare(b);

        if (this.canvastablecontainer.sortDescending) {
            this.canvastable.rows.sort((a : any, b : any) => 
                    compareFunction(getValue(a),getValue(b))
                );        
        } else {
            this.canvastable.rows.sort((a : any, b : any) => 
                    compareFunction(getValue(b),getValue(a))
                );        
        }
        this.canvastable.hasChanges = true;
    }
    
    rowSelected(rowIndex : number, colIndex : number,rowContent: DACSector) : void {
        if (this.canvastable.columns[colIndex] && this.canvastable.columns[colIndex].setValue) {
            this.canvastable.columns[colIndex].setValue(rowContent,
                !this.canvastable.columns[colIndex].getValue(rowContent));
            this.canvastable.hasChanges = true;            
        }
    }  
    
    public isSelectedRow(rowObj : DACSector) : boolean {
        return false;
    }
    
    isBoldRow(rowObj : DACSector) : boolean {
        return false;
    }                    
}