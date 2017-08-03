/* 
 *  Copyright 2010-2016 FinTech Neo AS ( fintechneo.com )- All rights reserved
 */

import {Injectable,NgZone} from '@angular/core';
import {AsyncSubject} from 'rxjs/AsyncSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/mergeMap';

declare var pdfMake : any;

@Injectable()
export class PDFService {
    scriptLoadedSubject : AsyncSubject<any>;
        
    constructor(private ngZone : NgZone) {
        
    }
    
    private loadScript(scripturl : string) : Observable<boolean> {        
        return new Observable((subscriber) => {
            this.ngZone.runOutsideAngular(() => {
                let scriptelm = document.createElement("script");
                scriptelm.src = scripturl;
                scriptelm.onload = () => {
                    this.ngZone.run(() => {
                        subscriber.next(true);
                    })
                };
                document.body.appendChild(scriptelm);
            });
        });                
    }

    private loadScripts() : Observable<any> {
        if (this.scriptLoadedSubject) {
            return this.scriptLoadedSubject;
        }
        this.scriptLoadedSubject = new AsyncSubject();
        this.loadScript("/js/pdfmake.min.js")
            .mergeMap(() => this.loadScript("/js/vfs_fonts.js"))
            .subscribe(() => {
                this.scriptLoadedSubject.next(true);                    
                this.scriptLoadedSubject.complete();    
            });

        return this.scriptLoadedSubject;   
    }   
  
    public createPDF(docDefinition : any,filename : string) : Observable<any> {
        return this.loadScripts()
            .mergeMap(() => new Observable((subscriber) => {
                pdfMake.createPdf(docDefinition).download(filename);
                subscriber.next();
        }));        
    }

    public convertImgToDataURLviaCanvas(url : string, outputFormat : string) : Observable<string> {
        return new Observable((subscriber) => {
            let img : HTMLImageElement = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
                let canvas : HTMLCanvasElement = document.createElement('canvas') as HTMLCanvasElement;
                var ctx = canvas.getContext('2d');
                var dataURL;
                canvas.height = img.height;
                canvas.width = img.width;
                ctx.drawImage(img, 0, 0);
                dataURL = canvas.toDataURL(outputFormat);                
                subscriber.next(dataURL);
                canvas = null;
            };
            img.src = url;
        });
    }

    public convertSVGElementToDataURLviaCanvas(svg : SVGSVGElement,outputFormat : string) : Observable<string> {        
        return new Observable((subscriber) => {
            let img : HTMLImageElement = document.createElement('img');

            img.width  = svg.width.baseVal.value;
            img.height = svg.height.baseVal.value;
            
            let svgblob = new Blob([svg.outerHTML], {type: 'image/svg+xml'});
            let url = URL.createObjectURL(svgblob);
            
            img.crossOrigin = 'Anonymous';
            img.addEventListener("load",() => {                
                let canvas : HTMLCanvasElement = document.createElement('canvas') as HTMLCanvasElement;
                let ctx = canvas.getContext('2d');
                let dataURL;
                canvas.height = img.height;
                canvas.width = img.width;
                ctx.drawImage(img, 0, 0);
                dataURL = canvas.toDataURL(outputFormat);                
                subscriber.next(dataURL);
                URL.revokeObjectURL(url);
                canvas = null;
            });   
            img.src = url;         
        });        
        
    }
}
