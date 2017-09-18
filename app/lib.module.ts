import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrgPanelBoardComponent } from './orgpanelboard/orgpanelboard.component';

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
