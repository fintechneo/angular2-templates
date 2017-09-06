import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class SINTEFMeasureStationService {
    constructor(private http : Http) {

    }

    public getMeasureStationData() : Observable<any> {
        return this.http.get("app/chart/APISascii.txt")
            .map((res) => res.text()
                .split("\n")
                .filter((line) => line.trim().length>0
                    && line.search("[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]")===0
                )
                .map((line) => line.split("\t"))                
                .map((row) => {
                    return {
                        timestamp: 
                            ((p) => new Date(
                                    parseInt(p[1]),
                                    parseInt(p[2])-1,
                                    parseInt(p[3]),
                                    parseInt(p[4]),
                                    parseInt(p[5]),
                                    parseInt(p[6])
                                ))(row[0].match(/([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9]) ([0-9][0-9]):([0-9][0-9]):([0-9][0-9])/))
                        ,
                        temperature: parseFloat(row[4].replace(",",".")),
                        precipitation1: parseFloat(row[1].replace(",",".")),
                        precipitation2: parseFloat(row[2].replace(",",".")),
                        precipitation3: parseFloat(row[3].replace(",",".")),
                        
                    };
                })
            );
    }
}