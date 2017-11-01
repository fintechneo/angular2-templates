
/**
 * @author Peter Salomonsen ( https://github.com/petersalomonsen )
 */

import { Injectable } from '@angular/core';
import { AbstractControl, FormArray,
        FormBuilder,
        FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs/Subject';

/**
 * Change notifications are sent with this class containing a string array for the
 * object path and the changed value.
 */
export class FormUpdateEvent {
    constructor(
        public path: string[],
        public value: any
    ) {

    }

    applyToObject(targetObject: any): void {
        let currentProperty = targetObject;
        for (let pathIndex = 0; pathIndex < this.path.length - 1; pathIndex++) {
            if (!currentProperty[this.path[pathIndex]]) {
                currentProperty[this.path[pathIndex]] = {};
            }
            currentProperty = currentProperty[this.path[pathIndex]];
        }
        currentProperty[this.path[this.path.length - 1]] = this.value;
    }
}

/**
 * Helper service for receiving change notifications on individual form controls
 */
@Injectable()
export class ReactiveFormAssistant {
    formGroup: FormGroup;

    formArrayPaths: string[][] = [];
    formUpdatesSubject: Subject<FormUpdateEvent> = new Subject();

    constructor(
        private formBuilder: FormBuilder) {

    }

    public cloneRow(rowctrl: AbstractControl): AbstractControl {
        if (rowctrl instanceof FormGroup) {
            const clonedRow = {};

            const fg = (rowctrl as FormGroup);
            Object.keys(fg.controls).forEach((k) =>
                clonedRow[k] = this.cloneRow(fg.controls[k])
            );
            return this.formBuilder.group(clonedRow);
        } else if (rowctrl instanceof FormControl) {
            const fc = (rowctrl as FormControl);
            return new FormControl(null, rowctrl.validator);
        }
    }

    public findControlByPath(path: string[]): AbstractControl {
        return path.reduce((formGroup: FormGroup, pathpart) =>
                formGroup.controls[pathpart]
            , this.formGroup) as AbstractControl;
    }

    public removeRowFromFormArray(
        formArray: FormArray,
        rowindex: number,
        notify = false) {

        formArray.removeAt(rowindex);

        if (notify) {
            const path = [];
            let group: FormGroup | FormArray = formArray;
            while (group.parent) {
                path.push(
                    Object.keys(group.parent.controls)
                        .find((k) => group.parent.controls[k] === group)
                );
                group = group.parent;
            }
            path.reverse();
            // Send entire array when deleting
            this.formUpdatesSubject.next(new FormUpdateEvent(path, formArray.value));
        }
    }

    public addRowToFormArray(formArray: FormArray,
            rowdata?: any,
            notify = false) {

        const formArrayTemplate = this.cloneRow(
            formArray.parent.controls[
                Object.keys(formArray.parent.controls)
                    .find(controlName =>
                        formArray.parent.controls[controlName] === formArray)
                    + 'ArrayTemplate']
            );

        formArray.push(
            formArrayTemplate
        );

        const ndx = formArray.length - 1;
        let path = this.formArrayPaths.find((p) =>
            this.findControlByPath(p) === formArray
        );
        path = path.concat([`${ndx}`]);

        this.controlsubscribe(
            formArray.at(ndx),
            path
        );

        if (rowdata) {
            formArray.at(ndx).patchValue(
                rowdata,
                {emitEvent: notify}
            );
        }
    }

    /**
     * Send full array update (useful when reordering)
     * @param formArray 
     */
    sendFullArray(formArray: FormArray) {
        let path = this.formArrayPaths.find((p) =>
            this.findControlByPath(p) === formArray
        );
        this.formUpdatesSubject.next(new FormUpdateEvent(path, formArray.value));   
    }

    patchFormUpdateEvent(msg: FormUpdateEvent) {
        if (msg.path.length > 0) {
            // Patching of individual controls
            const currentPath: string[] = [];

            const checkArray = (arr: FormArray, property: string): AbstractControl => {
                const arrIndex = parseInt(property, 10);
                while (arrIndex >= arr.length) {
                    // Add extra rows if needed
                    this.addRowToFormArray(arr);
                }
                return arr.controls[arrIndex];
            };

            const groupToPatch = msg.path.reduce((prev, property) => {
                currentPath.push(property);
                return prev instanceof FormGroup ? prev.controls[property] :
                    prev instanceof FormArray ?
                        checkArray(prev, property) :
                        prev;
                },
                this.formGroup as AbstractControl);

            if (groupToPatch instanceof FormArray) {
                /**
                 * We're patching the entire form array so we need
                 * to make sure the number of rows matches the incoming data
                 */

                const arrLength = Object.keys(msg.value).length;
                const formArray = groupToPatch as FormArray;

                while (arrLength > formArray.length) {
                    this.addRowToFormArray(formArray);
                }

                while (arrLength < formArray.length) {
                    formArray.removeAt(formArray.length - 1);
                }
            }
            groupToPatch.patchValue(msg.value, {emitEvent: false});
        } else {
            // Reset entire form
            this.formArrayPaths.forEach((path: string[]) => {
                    const formArray: FormArray = path.reduce((prev, property) =>
                        prev instanceof FormGroup ? prev.controls[property] : prev,
                        this.formGroup as AbstractControl) as FormArray;
                    let rows = path.reduce((prev, property) => prev ? prev[property] : null,
                        msg.value);

                    if (rows) {
                        // Array has values
                        if (!(rows instanceof Array)) {
                            // Convert to array
                            rows = Object.keys(rows).sort().map((k) => rows[k]);
                        }
                        rows.forEach((row: any, ndx: number) => {
                            this.addRowToFormArray(
                                formArray,
                                row
                            );
                        });
                    }
                }
            );
            this.formGroup.reset(msg.value, {emitEvent: false});
        }
    }

    public controlsubscribe(control: AbstractControl = this.formGroup
            , path: string[] = []) {
        if (control instanceof FormGroup) {
            Object.keys(control.controls).forEach((controlkey) => {
                path.push(controlkey);
                this.controlsubscribe(control.controls[controlkey], path.slice());
                path.pop();
            });
        } else if (control instanceof FormArray) {
            this.formArrayPaths.push(path);
            control.controls.forEach((arrctrl, ndx) => {
                path.push(`${ndx}`);
                this.controlsubscribe(arrctrl, path);
                path.pop();
            });
        } else if (control instanceof FormControl) {
            control.valueChanges
                .subscribe((val) =>
                    this.formUpdatesSubject.next(
                        new FormUpdateEvent(path, val)
                    )
            );
        }
    }
}
