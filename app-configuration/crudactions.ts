import {CrudAction} from "../server-actions/crudactions/crud-action";
import {CrudActionType} from "../enums/crud-actions.enum";
import {Aggregate} from "../server-actions/crudactions/aggregate";
import {AggregateType} from "../enums/aggregates.enum";

const myList = new CrudAction(
    CrudActionType.GetOne,
    ['account','watchlist'],
    {username: 'Pol'}
);
/*
//
const myList = e.select(e.Account, (account) => ({
    id: true,
    watchlist: {id: true},
    filter: e.op(account.username, '=', 'Pol')
})).watchlist;
*/
const crudactions: CrudAction[
    ] = [
    new CrudAction(
        CrudActionType.Get,
        'movie',
        undefined,
        undefined,
        {
            isInList: new Aggregate(
                AggregateType.Equals,
                new Aggregate(
                    AggregateType.Count,
                    ['movie', 'id'],
                    [myList, 'id']
                ),
                1
            )
        }
    ),
    new CrudAction(
        CrudActionType.AddOneToList,
        ['account', 'watchlist'],
        {username: 'Pol'},
        new CrudAction(
            CrudActionType.GetOne,
            'movie',
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
        {username: 'Pol'},
        // todo hoe weer de actie nu welk van de 2 binnengekomen ID's moet genomen worden voor onderstaande crud operatie?
        new CrudAction(
            CrudActionType.GetOne,
            'movie',
            undefined,
            undefined,
            {
                isInList: false
            }
        ))
]