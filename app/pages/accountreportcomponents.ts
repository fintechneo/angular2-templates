import {Component,ViewChild} from '@angular/core';
import {SVGLineChartComponent} from '../svgcharts/linechart.component';
import { DataService } from '../data.service';
import { PDFService } from '../pdfmake/pdf.service';
import { DatePipe } from '@angular/common';
import 'rxjs/add/operator/mergeMap';

@Component({    
    selector: 'accountOverview',
    template: `
        <style>
          .flextable {
            display: flex;
            flex-wrap: wrap;
          }
          .flextable div {
            padding: 10px;
            text-align: right;
            width: 70px;
          }
        </style>

        <mat-card style="max-height: 100px;">             
        <mat-card-content>
            <div class="flextable">
              <div>
                <h3>Start</h3>
                <p>{{linechart.horizNavLeft | date:'MMM yyyy'}}</p>
                <p>{{linechart.firstVisibleValue | number:'1.2-2'}}</p>
              </div>
              <div>
                <h3>End</h3>
                <p>{{linechart.horizNavRight | date:'MMM yyyy'}}</p>
                <p>{{linechart.lastVisibleValue| number:'1.2-2'}}</p>
              </div>                            
              <div>
                <h3>Returns</h3>
                <p style="color: #fff">-</p>
                <p>{{
                  (
                    (linechart.lastVisibleValue/
                    linechart.firstVisibleValue) -1.0
                  )*100 | number:'1.0-2'}} %
                </p>
              </div>
              <div>
                  <h3>Report</h3>
                  <button mat-raised-button (click)="createPDF()">Download as PDF</button>
            </div>
            </div>            
        </mat-card-content>
      </mat-card>
       <mat-card>
        <mat-card-header>
            <mat-icon mat-card-avatar>chart</mat-icon>
            <mat-card-title><span style="color: #fff">Chart</span></mat-card-title>
            <mat-card-subtitle>Equity</mat-card-subtitle>
        </mat-card-header>        
        <mat-card-content>
          <div style="width: 100%; height: 265px">
            <svg-linechart #linechart [xaxisnav]="true" [datapoints]="dataservice.datapoints" mode="standard">
            </svg-linechart>
          </div>
        </mat-card-content>        
      </mat-card>      
    `,
    providers: [DatePipe]
})
export class AccountOverviewComponent {
  @ViewChild("linechart") linechart : SVGLineChartComponent;
  
  constructor(public dataservice : DataService,
    public pdfservice : PDFService,
    private datepipe : DatePipe) {
  
  }
  
  public createPDF() {    
    let chartImage : string;
    this.pdfservice.convertSVGElementToDataURLviaCanvas(document.getElementsByTagName("svg")[0],"image/png")
        .mergeMap((res) => {
          chartImage = res;          
          return this.pdfservice.convertImgToDataURLviaCanvas(
            "companylogo.png","image/png");
        })
        .mergeMap((companyLogoDataURI) => {              
              let docDefinition = {
                pageSize: 'A4',
                pageOrientation: 'landscape',                
                header: {
                    
                },
                footer: (currentPage : number, pageCount: number) => {
                    return {
                        text: "Page"+                            
                        currentPage.toString() + ' / ' + pageCount,
                        alignment: "right",
                        margin: [40, 10] 
                  };
                },                                    
                content: 
                  [
                    {
                      table: {
                          widths: [300, '*'],
                          body: [
                              [{
                                  // if you specify both width and height - image will be stretched
                                  image: companyLogoDataURI,
                                  width: 150                             
                              },
                                  [{ 
                                      paddingTop: 10,
                                      text: "Report",                                
                                      fontSize: 20
                                  },
                                  {
                                      text: this.datepipe.transform(this.linechart.horizNavLeft,'MMM yyyy')+" - "+
                                        this.datepipe.transform(this.linechart.horizNavRight,'MMM yyyy')
                                  }
                                  ]
                              ]
                          ]
                      }, 
                      layout: 'noBorders'		
                  },
                  {
                    image: chartImage,                    
                    width: 750               
                  }
                ]
          };          

          return this.pdfservice.createPDF(docDefinition,"report.pdf");            
      }).subscribe();
  }  
}
