import { Injectable } from '@angular/core';
import { ReactiveFormAssistant, FormUpdateEvent } from './reactiveformsassistant';
import { AsyncSubject } from 'rxjs/AsyncSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/delayWhen';
import 'rxjs/add/observable/timer';

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
        let nextEventTime: number = 0;
        const minInterval = 51;

        this.reactiveFormAssistant.subscribe((reactiveformsassistant) => {
            reactiveformsassistant                
                .formUpdatesSubject                
                .delayWhen(() => {
                    // Hack since we're using localstorage
                    // we should make sure there's a minimum time between events
                    const now = new Date().getTime();
                    const delay = nextEventTime-now;
                    if(nextEventTime<now) {
                        nextEventTime=now+minInterval;
                    } else {
                        nextEventTime+=minInterval;
                    }                    
                    if(delay>0) {
                        return Observable.timer(delay);
                    } else {
                        return Observable.timer(0);
                    }
                })                
                .subscribe((msg) => {                
                
                msg.applyToObject(this.currentData);                
                localStorage.setItem(this.localStorageKey+"_update",JSON.stringify(msg));
                
                this.writedata();
            });
            this.syncdata();
            reactiveformsassistant.patchFormUpdateEvent(
                new FormUpdateEvent([],this.currentData)
            );
            window.setInterval(() => this.listenForMessages(),40);
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