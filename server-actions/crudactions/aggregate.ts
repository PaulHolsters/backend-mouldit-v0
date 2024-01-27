import {AggregateType} from "../../enums/aggregates.enum";
import {CrudAction} from "./crud-action";

export class Aggregate {
    constructor(public type: AggregateType,
                public source: string[] | Aggregate,
                // todo de select is problematisch denk ik
                public target?:number|[CrudAction,string] ) {
    }
}