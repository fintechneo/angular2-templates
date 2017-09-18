import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrgPanelBoardComponent } from './orgpanelboard/orgpanelboard.component';

/*
@Component({
    selector: "ftn-orgpanelboard",
    template: `<h1> Board Members </h1> `
})

export class OrgPanelBoardComponent {
    constructor() {
    }
}
*/


@NgModule({
    imports: [
       CommonModule
    ],
    declarations: [OrgPanelBoardComponent
    ],
    exports: [OrgPanelBoardComponent
    ]

})

export class OrgComponentsModule {

}

export { OrgPanelBoardComponent } from './orgpanelboard/orgpanelboard.component';