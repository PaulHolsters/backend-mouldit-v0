import {CrudAction} from "../server-actions/crudactions/crud-action";
import {CrudActionType} from "../enums/crud-actions.enum";
import e from "../dbschema/edgeql-js";
import {Aggregate} from "../server-actions/crudactions/aggregate";
import {AggregateType} from "../enums/aggregates.enum";

const myAccount= e.select(e.Account, (account) => ({
    id: true,
    watchlist: {id: true},
    filter: e.op(account.username, '=', 'Pol')
}));

const crudactions: CrudAction[
    ] = [
    new CrudAction(
        CrudActionType.Get,
        'movie',
        undefined,
        undefined,
        undefined,
        {
            isInList: new Aggregate(
                AggregateType.Equals,
                new Aggregate(
                    AggregateType.Count,
                    // todo controleer of dit wel is wat je wil
                    new CrudAction(
                        CrudActionType.GetOne,
                    ['account', 'watchlist'],
                        myAccount,
                        new Aggregate(
                            AggregateType.Equals,
                            // todo fix het probleem van overerving
                            ['movie','id'],
                            [undefined,'id']
                        )
                    )
                ),
                1
            )
        }
/*
todo deze calc prop is ingewikkelder =
{
            isInList:
            e.op(
                e.count(
                (e.select(myAccount.watchlist,(list)=>({
                id:true,
                // todo wat doet dit?
                filter:e.op(movie.id,'=',list.id)
            })))),
                '=',
                1)
*/
    ),
    new CrudAction(
        CrudActionType.AddOneToList,
        ['account', 'watchlist'],
        undefined,
        {username: 'Pol'},
        new CrudAction(
            CrudActionType.GetOne,
            'movie',
            undefined,
            undefined,
            undefined,
            {
                isInList: true
            }
        )
    ),
    new CrudAction(
        CrudActionType.RemoveOneFromList,
        ['account', 'watchlist'],
        undefined,
        {username: 'Pol'},
        new CrudAction(
            CrudActionType.GetOne,
            'movie',
            undefined,
            undefined,
            undefined,
            {
                isInList: false
            }
        ))
]
/*
*
e.select(myAccount.watchlist,(list)=>({
                    id:true,
                    filter:e.op(movie.id,'=',list.id)
}))

e.select(e.Account,(account)=>({
    id:true,
    watchlist:{id:true},
    filter: e.op(account.username,'=','Pol')
}));

* */
/*
*
* */