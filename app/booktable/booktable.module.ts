import { NgModule } from "@angular/core";
import { CanvasTableModule } from "../canvastable/canvastable.module";
import { BookTableComponent } from './booktable.component';
import { MatToolbarModule, MatInputModule } from "@angular/material";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";

@NgModule({
    imports: [
        FormsModule,
        MatInputModule,
        MatToolbarModule,
        CanvasTableModule,
        HttpClientModule
    ],
    declarations: [
        BookTableComponent
    ],
    exports: [
        BookTableComponent
    ]
})
export class BookTableModule {

}
