import {CrudActionType} from "../../enums/crud-actions.enum";

export class CrudAction {
    constructor(public type: CrudActionType,
                public concept: string|string[],
                public filter?:Object|Function,
                public returnValue?:CrudAction,
                public calculatedFields?:Object,
                public condition?:Function,
                public limit?:number,
                public pagination?:number
    ) {
    }
}