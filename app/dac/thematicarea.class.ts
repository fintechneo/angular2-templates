/* 
 *  Copyright 2010-2016 FinTech Neo AS ( fintechneo.com )- All rights reserved
 */

export class ThematicArea {        
    constructor(
        public id : number,
        public name : string,
        public groupName : string,
        public firstYear : number,
        public lastYear : number,
        public dacSectorCodes : number[]) {
            
    }    
}