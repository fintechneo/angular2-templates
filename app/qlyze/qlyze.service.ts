import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { AsyncSubject } from 'rxjs/AsyncSubject';
import 'rxjs/add/operator/map';

export class Stock {
    name: String;
    rsiScore: number;
    seasonalityScore: number;
    rocScore: number;
    volScore: number;
    totalScore: number;
}

@Injectable()
export class QlyzeService {
    stocks : AsyncSubject<Stock[]> = new AsyncSubject();
    public static baseUrl : string = "https://d2hen8z6ifxgk2.cloudfront.net/toplists/";
    params = {
                    horizon: "short",
                    market: "OSS"
                };  
    constructor(private http : Http,) {
        this.http.get(QlyzeService.baseUrl+this.params.market+"_"+this.params.horizon+".json")
    }
}