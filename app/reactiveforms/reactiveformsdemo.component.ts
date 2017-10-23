import {Component, DoCheck, Inject, OnInit, Input, Output,
    ViewChild, Renderer2, ElementRef, EventEmitter} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { MatDrawer } from '@angular/material';

import { FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { ReactiveFormAssistant } from './reactiveformsassistant';
import { LocalStorageDataService } from './localstoragedataservice';

export class Meeting {
    title = 'Meeting';
    dateAndTime: number = null;
    locationName: string = null;
    latitude: number = null;
    longitude: number = null;
    agendaItems: Array<AgendaItem> = [];
}

export class AgendaItem {
    public title: string = null;
    public description: string = null;
    public agendaItemType: string = null;
    public attachments: {[key: string]: string} = {};

    public static fromTitle(title: string): AgendaItem {
        const agendaItem = new AgendaItem();
        agendaItem.title = title;
        return agendaItem;
    }
}

@Component({
    moduleId: window['_moduleidroot']+'/reactiveforms/',
    templateUrl: 'reactiveformsdemo.component.html',
    selector: 'reactiveforms-demo-component',
    providers: [ReactiveFormAssistant,LocalStorageDataService]
})
export class ReactiveFormsDemoComponent implements DoCheck, OnInit {
    sidenavmode: string;
    sidenavopened = false;
    dropzonevisible = false;
    editing = false;

    agendaSuggestions: AgendaItem[] = [
        AgendaItem.fromTitle('Coffee break'),
        AgendaItem.fromTitle('Market update'),
        AgendaItem.fromTitle('New board member')
    ];

    @ViewChild('sidenav') sidenav: MatDrawer;
    @ViewChild('dragCanvas') dragCanvas: ElementRef;

    draggedAgendaItem: AgendaItem;

    dragEndListener: EventListener;

    formGroup: FormGroup;

    constructor(
        private renderer: Renderer2,
        private formBuilder: FormBuilder,
        private dataservice: LocalStorageDataService,
        private reactiveFormAssistant: ReactiveFormAssistant
    ) {
        this.formGroup = formBuilder.group(
            Object.assign(new Meeting(),
                {
                    agendaItemsArrayTemplate: formBuilder.group(new AgendaItem()),
                    agendaItems: formBuilder.array([])
                }
            )
        );
        this.dataservice.init('_reactiveformsdemo');
        this.reactiveFormAssistant.formGroup = this.formGroup;
        this.dataservice.reactiveFormAssistant.next(reactiveFormAssistant);
        this.dataservice.reactiveFormAssistant.complete();        
        this.reactiveFormAssistant.controlsubscribe();
    }

    ngOnInit() {
        this.dragEndListener = this.renderer.listen('window', 'dragend', () => {
            this.dropzonevisible = false;
        });
    }

    public ngDoCheck() {
        if (window.innerWidth > 768) {
            this.sidenavmode = 'side';
            this.sidenavopened = true;
        } else {
            this.sidenavmode = 'over';
        }
    }

    get agendaItems(): FormArray {
        return this.formGroup.get('agendaItems') as FormArray;
    }

    dragstart(event: DragEvent, agendaItem: AgendaItem) {
        event.dataTransfer.setData('text/plain', agendaItem.title);
        event.dataTransfer.effectAllowed = 'copy';

        const canv: HTMLCanvasElement = this.dragCanvas.nativeElement;

        const ctx: CanvasRenderingContext2D = canv.getContext('2d');
        ctx.font = '20px Roboto';
        canv.width = ctx.measureText(agendaItem.title).width;
        ctx.font = '20px Roboto';

        ctx.clearRect(0, 0, canv.width, canv.height);
        ctx.fillText(agendaItem.title, 0, 20);

        event.dataTransfer.setDragImage(canv, 0, 0);

        this.draggedAgendaItem = agendaItem;
        this.dropzonevisible = true;
    }

    drop(event: DragEvent) {
        event.preventDefault();

        this.reactiveFormAssistant.addRowToFormArray(
            this.formGroup.controls['agendaItems'] as FormArray,
            this.draggedAgendaItem,
            true
        );

        this.dropzonevisible = false;
    }

    deleteAgendaItem(index: number) {
        this.reactiveFormAssistant.removeRowFromFormArray(
            this.formGroup.controls['agendaItems'] as FormArray,
            index,
            true
        );
    }
}
