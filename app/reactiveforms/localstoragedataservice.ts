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

 const CLIENT_ID = new Date().getTime();

@Injectable()
export class LocalStorageDataService {
    reactiveFormAssistant: AsyncSubject<ReactiveFormAssistant> = new AsyncSubject();
    
    currentData: any = {};
    localStorageKey: string;
    previousMessage: string;

    constructor() {           
        let nextEventTime: number = 0;
        const minInterval = 1000;

        this.reactiveFormAssistant.subscribe((reactiveformsassistant) => {            
            
            reactiveformsassistant.patchFormUpdateEvent(
                new FormUpdateEvent([],this.currentData)
            );
            
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
                    this.writedata();   
                    msg['CLIENT_ID']=CLIENT_ID;            
                    localStorage.setItem(this.localStorageKey+"_update",JSON.stringify(msg));                                                            
                });            
            this.listenForMessages();
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

    private listenForMessages() {
        const msgdatastring = localStorage.getItem(this.localStorageKey+"_update");
        
        if(msgdatastring && msgdatastring !== this.previousMessage) { 
            this.previousMessage = msgdatastring;               
            try {
                const msg: FormUpdateEvent = JSON.parse(msgdatastring);                
                if(msg['CLIENT_ID']!==CLIENT_ID) {                    
                    this.reactiveFormAssistant.subscribe((rfa) =>
                        rfa.patchFormUpdateEvent(msg)
                    );
                }
            } catch(e) {}            
        }

        setTimeout(() => this.listenForMessages(),100);
    }

    writedata() {
        localStorage.setItem(this.localStorageKey,JSON.stringify(this.currentData));
    }
}