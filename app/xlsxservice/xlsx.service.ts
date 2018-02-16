/* 
 *  Copyright 2010-2016 FinTech Neo AS ( fintechneo.com )- All rights reserved
 */

import { Injectable,NgZone } from '@angular/core';
import { AsyncSubject } from 'rxjs/AsyncSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { CanvasTableComponent, CanvasTableColumn } from '../canvastable/canvastable.component';

declare var XLSX : any;

@Injectable()
export class XLSXService {
    scriptLoadedSubject : AsyncSubject<any>;
    xlsx : any;
    
    constructor(private ngZone : NgZone) {
        
    }
    
    private loadScripts() {
        if (this.scriptLoadedSubject) {
            return;
        }
        this.scriptLoadedSubject = new AsyncSubject();
        this.ngZone.runOutsideAngular(() => {
            let scriptelm = document.createElement("script");
            scriptelm.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.12.1/xlsx.core.min.js";
            scriptelm.onload = () => {
                this.ngZone.run(() => {
                    console.log("Excel script loaded");
                    this.scriptLoadedSubject.next(XLSX);
                    this.xlsx = XLSX;
                    this.scriptLoadedSubject.complete();    
                });         
            };
            document.body.appendChild(scriptelm);
        });     
    }
    
    getXLSX() : Observable<any> {
        this.loadScripts();
        return this.scriptLoadedSubject;        
    }
    
    getCellRef(colIndex : number,rowIndex : number) {
        return this.xlsx.utils.encode_cell({c: colIndex, r: rowIndex+1})
    };
        

    parse(arraybuffer : ArrayBuffer) : Observable<any> {                
        /* convert data to binary string */
        var data = new Uint8Array(arraybuffer);
        var arr = new Array();
        for(var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
        var bstr = arr.join("");

        return this.getXLSX().map((xlsx) => xlsx.read(bstr,{type: "binary"}));
    }

    writeAndDownload(filename : string,wb : any) {
        let wopts = { bookType:'xlsx', bookSST:false, type:'binary' };                
        let wbout = this.xlsx.write(wb,wopts);

        let s2ab = (s : string) => {                    
            let buf = new ArrayBuffer(s.length);
            let view = new Uint8Array(buf);
            for (let i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
            return buf;
        };

        let a = document.createElement("a");
        let theurl = URL.createObjectURL(new Blob([s2ab(wbout)],{type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}));
        a.href = theurl;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(theurl);
    }

    exportCanvasTableToExcel(canvastable: CanvasTableComponent, sheetname: string) {
        this.getXLSX().subscribe((xlsx : any) => 
            {
                // Create sheet
                let sheet : any = {};
                let wscols : any[] = [];
                //let boldCellStyle = { font: { name: "Verdana", sz: 11, bold: true, color: "FF00FF88"}, fill: {fgColor: {rgb: "FFFFAA00"}}};
                canvastable.columns.forEach(
                    (col : CanvasTableColumn,ndx : number) => {                    
                        let cellref = xlsx.utils.encode_cell({c: ndx, r: 0});
                        sheet[cellref] = { 
                            t: "s", 
                            v: col.name,
                            s: { font: { bold: true }, fill: col.backgroundColor ? { fgColor: { rgb: "FF"+col.backgroundColor.substr(1)}}: null}
                        };                    
                        wscols.push({ wpx: col.width});
                });
                                
                sheet['!cols'] = wscols;
                canvastable.rows.forEach((row,rowIndex)=> {
                    canvastable.columns.forEach(
                    (col : CanvasTableColumn,colIndex : number) => {
                        let cellref = xlsx.utils.encode_cell({c: colIndex, r: rowIndex+1});
                        let val = col.getValue(row);
                        if (val) {
                            let cell : any = {
                                v: col.getValue(row)                           
                            };
                            if(typeof cell.v === 'number') {
                                cell.t = 'n';
                                cell.s = {numFmt: "# ##0",
                                        fill: col.backgroundColor ? { fgColor: { rgb: "FF"+col.backgroundColor.substr(1)}}: null};
                            } else if(typeof cell.v === 'boolean') {
                                cell.t = 'b';
                            }
                            else {
                                cell.t = 's';
                            }
                            if(col.excelCellAttributes) {
                                Object.assign(cell,col.excelCellAttributes);
                            }
                            sheet[cellref] = cell;
                        }
                    });
                });
                let range = { s: { c: 0, r: 0}, e: {c: canvastable.columns.length, r:canvastable.rows.length+1 }};
                sheet['!ref'] = xlsx.utils.encode_range(range);
                
                let wb = { SheetNames:[sheetname], Sheets:{ }};                
                wb.Sheets[sheetname] = sheet;
                this.writeAndDownload(sheetname+".xlsx",wb);                
            }
        );
    }
}