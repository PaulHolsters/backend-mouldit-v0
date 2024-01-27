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
    /*
    *
    * */
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
    /*
    *
const removeMovieFromList = async function removeMovieFromList(id:string|undefined) {
        if(id){
            const movie = e.select(e.Movie,(m)=>({
                filter_single: {id: id}
            }))
            e.update(e.Account,(acc)=>({
                filter_single: {username: 'Pol'},
                set: {
                    watchlist: {"-=":movie}
                }
            })).run(client)
            return e.select(e.Movie,()=>({
                id: true,
                title: true,
                actors: {name: true},
                release_year: true,
                isInList:e.bool(false),
                filter_single: {id: id}
            })).run(client)
        }
        return null
    }
    * */
    new CrudAction(
        CrudActionType.RemoveOneFromList,
        ['account', 'watchlist'],
        {username: 'Pol'},
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
// todo bedenking:  zonder schema introspectie werkt de TypeScript builder niet, dit wil zeggen dat gewoon edgedb gebruiken eigenlijk evengoed is dan Mouldit voor een developer
//                  dus de vraag is: wat is de meerwaarde van backend-mouldit?
//                  antwoord: zonder business types heeft dit geen enkele meerwaarde voor een developer
