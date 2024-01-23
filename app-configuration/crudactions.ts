import {CrudAction} from "../server-actions/crudactions/crud-action";
import {CrudActionType} from "../enums/crud-actions.enum";
import e from "../dbschema/edgeql-js";
/*
const myAccount = e.select(e.Account,(account)=>({
    id:true,
    watchlist:{id:true},
    filter: e.op(account.username,'=','Pol')
}));
*/
const crudactions:CrudAction[
] = [
    // todo ook hier een bijzonder return request: calculated field isInList, waarvoor de account ook moet gequeried worden
    new CrudAction(CrudActionType.Get, 'movie'),
    // todo add return request
    new CrudAction(CrudActionType.AddOneToList, ['account','watchlist'],{username:'Pol'},
        new CrudAction(CrudActionType.GetOne, 'movie',undefined,undefined,
            // todo hoe zou je hier in TS kunnen verwijzen naar een eerder resultaat
            //      lastig, beter hier iets puur Mouldit van maken
            //      dwz je moet methodes als count, equals '=' als Mouldit aanbieden
            {
                isInList:e.op(e.count(),'=',1)
            })),
    new CrudAction(CrudActionType.RemoveOneFromList, ['account','watchlist'],{username:'Pol'})
]
/*
* e.select(myAccount.watchlist,(list)=>({
                    id:true,
                    filter:e.op(movie.id,'=',list.id)
                }))
* */