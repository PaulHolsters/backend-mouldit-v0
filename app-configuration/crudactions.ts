import {CrudAction} from "../server-actions/crudactions/crud-action";
import {CrudActionType} from "../enums/crud-actions.enum";

const crudactions:CrudAction[
] = [
    new CrudAction(CrudActionType.Get, 'movie'),
    new CrudAction(CrudActionType.AddOneToList, ['account','watchlist'],{username:'Pol'}),
    new CrudAction(CrudActionType.RemoveOneFromList, ['account','watchlist'],{username:'Pol'})
]
