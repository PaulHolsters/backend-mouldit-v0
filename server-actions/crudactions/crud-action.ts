import {CrudActionType} from "../../enums/crud-actions.enum";
import {$expr_Select} from "../../dbschema/edgeql-js/select";
import {ObjectType} from "../../dbschema/edgeql-js/typesystem";
import {Aggregate} from "./aggregate";

export class CrudAction {
    constructor(public type: CrudActionType,
                public concept: string|string[],
                public baseQuery?:$expr_Select<{__element__: ObjectType<any>, __cardinality__: any}>,
                public filter?:Object|Function|Aggregate,
                public returnValue?:CrudAction,
                public calculatedFields?:Object,
                public condition?:Function,
                public limit?:number,
                public pagination?:number
    ) {
    }
}