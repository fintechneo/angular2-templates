import { Component, OnInit, OnChanges, Input, ViewChild } from '@angular/core';
import { CanvasTableSelectListener,CanvasTableContainerComponent,CanvasTableComponent,CanvasTableColumn} from '../canvastable/canvastable.module';
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
@Component({
  moduleId: "app/qlyze/",
  selector: 'qlyze-table',
  templateUrl: 'qlyze-table.component.html'
})

export class QlyzeTableComponent {
    constructor(private http : Http){
        this.reloadTopList();
        }
    baseUrl : string = "https://d2hen8z6ifxgk2.cloudfront.net/toplists/";
    params = {
                    horizon: "short",
                    market: "OSS"
                };  
    dataReady = false
    thelist: any[] = []
    availableMarkets: any[] = [
                    {id: "NSQ", name: "Nasdaq" },
                    {id: "NYS", name: "NYSE"},
                    {id: "LSE", name: "London"},
                    {id: "FS", name: "Frankfurt"},
                    {id: "ENP", name: "Paris"},
                    {id: "OSS", name: "Oslo"},
                    {id: "SSE", name: "Stockholm"},
                    {id: "CSS", name: "Copenhagen"},
                    {id: "HSS", name: "Helsinki"}
                ]
    reloadTopList(){

                    if (this.params.market && this.params.market !== "") {
                        this.http.get(this.baseUrl + this.params.market + "_" + this.params.horizon + ".json")
                            .toPromise().then(response => this.thelist
                                );
                    } else {
                        this.thelist = [];
                    }
    }
    @ViewChild(CanvasTableContainerComponent) canvastablecontainer : CanvasTableContainerComponent;
    canvastable : CanvasTableComponent;
    ngOnInit() {
        this.canvastable = this.canvastablecontainer.canvastable;
        this.canvastable.columns = [
            {
                name: "Name",
                getValue: (r) => r.name,
                getFormattedValue: (val) => val.name,
                width: 100,
                sortColumn: 0
            },
            {
                name: "Total",
                getValue: (r) => r.totalScore,
                getFormattedValue: (val) => val.toLocaleString(undefined,{minimumFractionDigits: 2}),
                width: 200,
                textAlign: 1,
                sortColumn: 1
            }
        ]; 
        this.canvastable.rows = this.thelist;
    }       
    selectedMarket: any   
                
                
}
