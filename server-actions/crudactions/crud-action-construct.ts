import {CrudActionType} from "../../enums/crud-actions.enum";
import {Aggregate} from "./aggregate";

export class CrudActionConstruct {
    constructor(public type: CrudActionType,
                public concept: string|string[],
                public filter?:Object|Function|Aggregate,
                public calculatedFields?:Object,
                public condition?:Function,
                public limit?:number,
                public pagination?:number
    ) {
    }
}