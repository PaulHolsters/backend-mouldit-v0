import {CrudAction} from "../server-actions/crudactions/crud-action";
import {CrudActionType} from "../enums/crud-actions.enum";
import {Aggregate} from "../server-actions/crudactions/aggregate";
import {AggregateType} from "../enums/aggregates.enum";
import {CrudActionConstruct} from "../server-actions/crudactions/crud-action-construct";

const myList = new CrudActionConstruct(
    CrudActionType.GetOne,
    ['account', 'watchlist'],
    {username: 'Pol'}
)
// je neemt de id van het overeenkomstige concept uit de conceptIds
// je geeft het aantal records uit de target na het uitvoeren van de query die qua id gelijk is
// je neemt id wanneer er verder geen property staat
export const crudActions: CrudAction[
    ] = [
    new CrudAction(
        CrudActionType.GetOne,
        ['account', 'watchlist'],
        {username: 'Pol'}
    ),
    new CrudAction(
        CrudActionType.Get,
        'movie',
        undefined,
        undefined,
        {
            isInList:
            // todo hoe resolven we dit het beste? het resultaat van een aggregate MOET een edgeql Query zijn! niet het resultaat van de executie ervan!
                new Aggregate(
                    AggregateType.Equals,
                    new Aggregate(
                        AggregateType.CountEquals,
                        'movie', // todo niet nodig: dit volgt uit de bovenste query
                        myList
                    ),
                    1
                )
        }
    ),
    new CrudAction(
        CrudActionType.AddOneToList,
        ['account', 'watchlist'],
        // indien er een ID aanwezig is wordt dit genegeerd indien er een filter is
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
