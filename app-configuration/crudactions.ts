import {CrudAction} from "../server-actions/crudactions/crud-action";
import {CrudActionType} from "../enums/crud-actions.enum";

const crudactions:CrudAction[
] = [
    // todo ook hier een bijzonder return request: calculated field isInList, waarvoor de account ook moet gequeried worden
    new CrudAction(CrudActionType.Get, 'movie'),
    // todo add return request
    new CrudAction(CrudActionType.AddOneToList, ['account','watchlist'],{username:'Pol'}),
    new CrudAction(CrudActionType.RemoveOneFromList, ['account','watchlist'],{username:'Pol'})
]
