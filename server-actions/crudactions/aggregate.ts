import {AggregateType} from "../../enums/aggregates.enum";
import {CrudActionConstruct} from "./crud-action-construct";

export class Aggregate {
    constructor(public type: AggregateType,
                public source: string | Aggregate,
                // todo de select is problematisch denk ik
                public target?:number|CrudActionConstruct ) {
    }
}