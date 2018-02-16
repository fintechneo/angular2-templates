/* 
 *  Copyright 2010-2016 FinTech Neo AS ( fintechneo.com )- All rights reserved
 */


import { Component,ViewChild,OnInit,DoCheck } from '@angular/core';
import { AnimationFrameThrottler,CanvasTableSelectListener,CanvasTableColumn,CanvasTableContainerComponent,CanvasTableComponent } from '../canvastable/canvastable.module';

import { MatDialog,MatDialogRef } from '@angular/material';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

export class BookData {
    id: string;
    author: string;
    price: number;
    title: string;
    category: string;
}

@Component({ 
    moduleId: 'app/booktable/',
    
    templateUrl: "booktable.component.html",
    
})
export class BookTableComponent implements CanvasTableSelectListener,OnInit {
    
    @ViewChild(CanvasTableContainerComponent) canvastablecontainer : CanvasTableContainerComponent;
    canvastable : CanvasTableComponent;    
    
    rowdata: BookData[] = [];

    constructor(        
            private http: HttpClient
        ) {
                        
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
        
    ngOnInit() {
        this.canvastable = this.canvastablecontainer.canvastable;
        this.canvastable.autoRowWrapModeWidth = 0; // No row wrapping
        this.canvastable.columns = [
            {
                name: 'author',
                getValue: (book: BookData) => book.author,
                width: 150,
                sortColumn: 0
            },
            {
                name: 'title',
                getValue: (book: BookData) => book.title,
                width: 150,
                sortColumn: 1
            },
            {
                name: 'price',
                getValue: (book: BookData) => book.price,
                width: 100,
                sortColumn: 2
            },
            {
                name: 'category',
                getValue: (book: BookData) => book.category,
                width: 150,
                sortColumn: 3
            }
        ];
        this.http.get('https://bokbyen.no/allbooks.php')
            .pipe(
                map(
                    (res: any[]) =>
                        res.map(r => Object.assign({}, r, {price: parseFloat(r.price)}))
                )
            ).subscribe((res: BookData[]) => {
                this.rowdata = res;
                this.updateCanvasTableData();
            });
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
    
    rowSelected(rowIndex : number, colIndex : number,rowContent: any) : void {
        
    }  
    
    public isSelectedRow(rowObj : any) : boolean {
        return false;
    }
    
    isBoldRow(rowObj : any) : boolean {
        return false;
    }                    
}