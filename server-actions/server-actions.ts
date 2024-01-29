import {CrudAction} from "./crudactions/crud-action";
import {ActionIdType} from "../types/aliases";
import helpers from "../helpers/general-helpers"
import {CrudActionType} from "../enums/crud-actions.enum";
import e from "./../dbschema/edgeql-js"
import * as edgedb from "edgedb";
import {Aggregate} from "./crudactions/aggregate";
import {AggregateType} from "../enums/aggregates.enum";

export class ServerActions {
    private static serverActions: CrudAction[] = []

    public static addAction(action: CrudAction) {
        this.serverActions.push(action)
    }

    private static constructId(ca: CrudAction): string {
        if (ca.concept instanceof Array) {
            return ca.type + helpers.capitalizeFirst(ca.concept.map(p => helpers.capitalizeFirst(p)).join(''))
        }
        return ca.type + helpers.capitalizeFirst(ca.concept)
    }

    private static getIdForConcept(concept: string, conceptIds: { [key: string]: any }): string {
        return (conceptIds as { [key: string]: any })[concept]
    }

    private static async resolveAggregate(r:any, a: Aggregate,  client: edgedb.Client,conceptIds: (({ [key: string]: any })|undefined)): any{
        console.log('resolving aggr',conceptIds)
        let source: Aggregate | string | boolean | number = a.source
        const target = a.target
        switch (a.type) {
            case AggregateType.Equals:
                if (source instanceof Aggregate) {
                    console.log('de equals pre')
                    source = await this.resolveAggregate(r,source,  client,conceptIds)
                    console.log('de equals',source) // todo tot hier geraak ik niet
                    if (typeof source === 'number' && typeof target === 'number') return source === target
                }
                throw new Error('possibility not implemented')
            case AggregateType.CountEquals:
                if (typeof source === 'string' && target instanceof CrudAction) {
                    const sourceCt = source
                    console.log('should be movie',sourceCt)
                    const actionId: string = this.constructId(target)
                    console.log('id',actionId)
                    // het gaat om een getOne actie namelijk de lijst van Pol ophalen
                    const result = await this.executeAction(actionId, client, conceptIds)
                    /*
resultaat lijst pol = lijst met film ids {
  watchlist: [
    { id: '1d01ca30-b6cc-11ee-810c-5355de4f6cd5' },
    { id: '1d01d1d8-b6cc-11ee-810c-634c3c550a7b' },
    { id: '1d01d3d6-b6cc-11ee-810c-bb254af1e63e' },
    { id: '1d01d57a-b6cc-11ee-810c-27c3edab721c' },
    { id: '1d01d714-b6cc-11ee-810c-b73c23411c9e' },
    { id: '1d01d89a-b6cc-11ee-810c-6b54d12b3bd6' }
  ]
}
                    * */
                    console.log('er moeten concept ids zijn maar die zijn er niet',conceptIds)
                    if (result instanceof Array && conceptIds) {
                        // het is een lijst met films uit de watchlist van Pol
                        return result.reduce((p, c) => {
                            (c.id === this.getIdForConcept(sourceCt, conceptIds)) ? p++ : p
                        }, 0)
                    }
                }
                throw new Error('possibility not implemented')
            default:
                throw new Error('aggregate type' + a.type + ' not implemented')
        }
    }
    private static async calculateInnerSelect(r: any, calcFields: Object,client: edgedb.Client,conceptIds: (({ [key: string]: any })|undefined)): any {
        const objToSelect : { [key: string]: any }= {}
        for (const [k, v] of Object.entries(calcFields)) {
            // in ons voorbeeld zal dit maar 1 property 'isInList' zijn
            if (v instanceof Aggregate) {
                // todo werk recursie weg
                console.log('ok for now', k, v)
                /*
                *             id: true,
            title: true,
            actors: {name: true},
            release_year: true,
            * // todo dit moet je terugsturen => een query dus .run(client) NIET doen!
            isInList:
            *
            * e.op(                                   * new Aggregate(AggregateType.Equals
            *   e.count((                               ** new Aggregate(AggregateType.CountEquals
            *       e.select(                               *** new CrudActionConstruct(...
            *           myAccount.watchlist,(r)=>({
                            id:true,
                            filter:
                            * e.op(                              **
                            *   movie.id,                           'movie'
                            *   '=',                                 **
                            *   r.id)})))                            ***
                            * ),
            *   '=',                                              *,
            *   1)                                                1
            *
            * todo hoe kunnen we het één nu construeren uit het andere?
            *  (het resultaat van een aggregaat is altijd een constructie
            *   zoals hierboven te gebruiken binnen een echte crudactie
            *
                * */
                objToSelect[k] = await this.resolveAggregate(r,v, client, conceptIds)
            }
        }
    }

    public static async executeAction(id: ActionIdType, client: edgedb.Client,conceptIds: (({ [key: string]: any })|undefined))
        : Promise<unknown> {
        const ca = this.serverActions
            .find(sa => id === sa.type + (sa.concept instanceof Array ?
                sa.concept.map(p => helpers.capitalizeFirst(p)).join('') :
                helpers
                    .capitalizeFirst(sa.concept)))
        // todo fix bugeen geneste CrudActie kan niet gevonden worden bv. de getOne voorlopig copy paste
        //              later via algoritme deeper search
        if (ca) {
            switch (ca.type) {
                case CrudActionType.Get:
                    if (typeof ca.concept === 'string') {
                        const concept = (e as any)[helpers.capitalizeFirst(ca.concept)]
                        const objToSelect = {
                            ...concept['*'],
                        }
                        if (ca.calculatedFields) {
                            const calcFields = ca.calculatedFields
                            return e.select(concept, (r:any) => (this.calculateInnerSelect(r,calcFields,client,conceptIds))).run(client)
                        }
                        return e.select(concept, (r:any) => (objToSelect)).run(client)
                    } else throw new Error('concept in crud action not implemented')
                case CrudActionType.GetOne:
                    console.log('getOne',ca)
                    if (ca.concept instanceof Array && ca.concept.length === 2) {
                        if (ca.filter && typeof ca.filter === 'object' && !(ca.filter instanceof Aggregate)) {
                            const objToSelect: { [key: string]: any } = {}
                            objToSelect[ca.concept[1]] = {id: true}
                            const concept = (e as any)[helpers.capitalizeFirst(ca.concept[0])]
                            // todo zeker checken of dit eigenlijk wel mogelijk is
                            console.log('crud resturn about to happen',concept)
                            return e.select(concept, (r: any) => ({
                            ...objToSelect,
                                filter_single: {...ca.filter} as any
                            })).run(client)
                        }
                    }
                    throw new Error('concept in crud action not implemented')
                case CrudActionType.AddOneToList:
                    if (ca.concept instanceof Array && ca.concept.length === 2 && conceptIds) {
                        const mainConcept = helpers.capitalizeFirst(ca.concept[0])
                        const setObj: any = {}
                        setObj[ca.concept[1]] = {"+=": conceptIds[ca.concept[1]]}
                        if (ca.filter && typeof ca.filter === 'object' && !(ca.filter instanceof Aggregate)) {
                            // todo zeker checken of dit eigenlijk wel mogelijk is
                            e.update((e as any)[mainConcept], (r:any) => ({
                                filter_single: {...ca.filter} as any,
                                set: setObj
                            })).run(client)
                        } else {
                            e.update((e as any)[mainConcept], () => ({
                                filter_single: ({id: conceptIds[ca.concept[0]]} as unknown) as any,
                                set: setObj
                            })).run(client)
                        }
                        if (ca.returnValue) {
                            // todo werk recursie weg: dit is een query dus je lost het op door queries en mutation uit elkaar te trekken
                            return this.executeAction(ca.type + helpers.capitalizeFirst(ca.concept.map(p => helpers.capitalizeFirst(p)).join()), client, conceptIds)
                        }
                    }
                    throw new Error('concept in crud action mal configurered')
                case CrudActionType.RemoveOneFromList:
                    if (ca.concept instanceof Array && ca.concept.length === 2 && conceptIds) {
                        const mainConcept = helpers.capitalizeFirst(ca.concept[0])
                        const setObj: any = {}
                        setObj[ca.concept[1]] = {"-=": conceptIds[ca.concept[1]]}
                        if (ca.filter && typeof ca.filter === 'object' && !(ca.filter instanceof Aggregate)) {
                            // todo zeker checken of dit eigenlijk wel mogelijk is
                            e.update((e as any)[mainConcept], (r:any) => ({
                                filter_single: {...ca.filter} as any,
                                set: setObj
                            })).run(client)
                        } else {
                            e.update((e as any)[mainConcept], () => ({
                                filter_single: ({id: conceptIds[ca.concept[0]]} as unknown) as any,
                                set: setObj
                            })).run(client)
                        }
                        if (ca.returnValue) {
                            return this.executeAction(ca.type + helpers.capitalizeFirst(ca.concept.map(p => helpers.capitalizeFirst(p)).join()), client, conceptIds)
                        }
                    }
                    throw new Error('concept in crud action mal configurered')
                default:
                    throw new Error('Crudaction type not implemented')
            }
        } else throw new Error('bad request')
    }
}
