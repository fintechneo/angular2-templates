/* 
 *  Copyright 2010-2016 FinTech Neo AS ( fintechneo.com )- All rights reserved
 */

import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { AsyncSubject } from 'rxjs/AsyncSubject';
import 'rxjs/add/operator/map';

export class DACSector {
    code : number;
    category : number;
    formattedCode: string;
    name : string;
    nameFR : string;
    description : string;
    descriptionFR : string;   
    thematicAreaMap : { [key : string] : boolean } = {};
}

@Injectable()
export class DACCodeListsService {
    dacSectors : AsyncSubject<DACSector[]> = new AsyncSubject();
    public static baseUrl : string = "";
    
    constructor(
        private http : Http,
    ) {
        this.http.get(DACCodeListsService.baseUrl+"app/dac/DAC_codeLists.xml")
            .map((res) => new DOMParser().parseFromString(res.text(),"text/xml"))
            .subscribe((xml : Document) => {
                let dacSectorElements : NodeList = xml.querySelectorAll("Codelist[name=Sector] codelist-item");
                let dacSectors : DACSector[] = [];
                
                for (let n = 0; n < dacSectorElements.length;n++) {
                    let dacSectorElement = dacSectorElements[n];
                    let dacSector = new DACSector();
                    for (let c = 0; c < dacSectorElement.childNodes.length;c++) {
                        let field : Node = dacSectorElement.childNodes[c];
                        switch(field.nodeName) {
                            case "code":
                                dacSector.code = parseInt(field.firstChild.nodeValue);
                                let codestring = (dacSector.code+"");
                                dacSector.formattedCode = codestring.substring(0,3)+
                                    (codestring.length > 3 ? "." + codestring.substring(3) : "");
                                break;
                            case "category":
                                dacSector.category = parseInt(field.firstChild.nodeValue);
                                break;
                            case "name":
                                if (field.attributes.getNamedItem("xml:lang") && 
                                        field.attributes.getNamedItem("xml:lang").value==="fr") {
                                    dacSector.nameFR = field.firstChild.nodeValue;
                                } else {
                                    dacSector.name = field.firstChild.nodeValue;
                                }
                                break;
                            case "description":
                                if (field.attributes.getNamedItem("xml:lang") && 
                                        field.attributes.getNamedItem("xml:lang").value==="fr") {
                                    dacSector.descriptionFR = field.firstChild ? field.firstChild.nodeValue : null;
                                } else {
                                    dacSector.description = field.firstChild ? field.firstChild.nodeValue : null;
                                }
                                break;
                        }
                    }
                    dacSectors.push(dacSector);
                }
                this.dacSectors.next(dacSectors);
                this.dacSectors.complete();
            });
    }
}