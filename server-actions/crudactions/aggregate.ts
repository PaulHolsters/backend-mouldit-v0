import {AggregateType} from "../../enums/aggregates.enum";
import {CrudAction} from "./crud-action";

export class Aggregate {
    constructor(public type: AggregateType,
                public source: string | CrudAction | Aggregate,
                public target?: number | string) {
    }
}