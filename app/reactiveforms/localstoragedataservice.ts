import { Injectable } from '@angular/core';
import { ReactiveFormAssistant, FormUpdateEvent } from './reactiveformsassistant';
import { AsyncSubject } from 'rxjs/AsyncSubject';

/**
 * Simple dataservice for testing realtime form updates.
 * 
 * This uses localstorage to work without a server - just for testing purposes.
 * 
 * In production you should use a websocket server instead.
 */

@Injectable()
export class LocalStorageDataService {
    reactiveFormAssistant: AsyncSubject<ReactiveFormAssistant> = new AsyncSubject();
    
    currentData: any = {};
    localStorageKey: string;
    
    constructor() {        
        this.reactiveFormAssistant.subscribe((reactiveformsassistant) => {
            reactiveformsassistant.formUpdatesSubject.subscribe((msg) => {
                msg.applyToObject(this.currentData);
                
                localStorage.setItem(this.localStorageKey+"_update",JSON.stringify(msg));
                
                this.writedata();
            });
            this.syncdata();
            reactiveformsassistant.patchFormUpdateEvent(
                new FormUpdateEvent([],this.currentData)
            );
            window.setInterval(() => this.listenForMessages(),100);
        });
    }

    init(localStorageKey: string) {
        this.localStorageKey = localStorageKey;
        this.syncdata();
    }

    syncdata() {
        const storeddatastring = localStorage.getItem(this.localStorageKey);
        if(storeddatastring) {
            try {
                this.currentData = JSON.parse(storeddatastring);
            } catch(e) {}
        }
    }

    listenForMessages() {
        const msgdatastring = localStorage.getItem(this.localStorageKey+"_update");

        if(msgdatastring) {    
            
            try {
                const msg: FormUpdateEvent = JSON.parse(msgdatastring);
                this.reactiveFormAssistant.subscribe((rfa) =>
                    rfa.patchFormUpdateEvent(msg)
                );
                
            } catch(e) {}            
        }
    }

    writedata() {
        localStorage.setItem(this.localStorageKey,JSON.stringify(this.currentData));
    }
}