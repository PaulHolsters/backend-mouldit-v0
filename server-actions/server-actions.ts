import {CrudAction} from "./crudactions/crud-action";
import {ActionIdType} from "../types/aliases";
import helpers from "../helpers/general-helpers"
import {CrudActionType} from "../enums/crud-actions.enum";
import e from "./../dbschema/edgeql-js"
import * as edgedb from "edgedb";
import {Aggregate} from "./crudactions/aggregate";
import {AggregateType} from "../enums/aggregates.enum";
import {CrudActionConstruct} from "./crudactions/crud-action-construct";

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
    // todo alles aanpassen naar query construct waar nodig
    private static replaceJSWithEdgeQL(calFields:Object):Object{
        const calcFieldsCopy: { [key: string]: any } = {...calFields}
        Object.entries(calFields).forEach(([k,v])=>{
            if(typeof v === 'boolean') {calcFieldsCopy[k]=e.bool(v)}
        })
        return calcFieldsCopy
    }
    private static async executeResponseRequest(query: CrudAction, client: edgedb.Client, conceptIds: ({ [key: string]: any }| undefined)): Promise<unknown> {
        switch (query.type) {
            case CrudActionType.GetOne:
                if (query.concept instanceof Array && query.concept.length === 2) {
                    if (query.filter && typeof query.filter === 'object' && !(query.filter instanceof Aggregate)) {
                        const objToSelect: { [key: string]: any } = {}
                        objToSelect[query.concept[1]] = {id: true}
                        const concept = (e as any)[helpers.capitalizeFirst(query.concept[0])]
                        return e.select(concept, (r: any) => ({
                            ...objToSelect,
                            filter_single: {...query.filter} as any
                        })).run(client)
                    }
                } else if(typeof query.concept === 'string' && !query.filter && conceptIds){
                    const id = conceptIds[query.concept]
                    const concept = (e as any)[helpers.capitalizeFirst(query.concept)]
                    const objToSelect: { [key: string]: any } = {
                        ...concept['*']
                    }
                    if(query.calculatedFields){
                        Object.assign(objToSelect,this.replaceJSWithEdgeQL(query.calculatedFields))
                    }
                    return e.select(concept, (r: any) => ({
                        ...objToSelect,
                        filter_single: {id:id} as any
                    })).run(client)
                }
                throw new Error('concept in crud action not implemented')
        }
    }
    public static async executeAction(id: ActionIdType, client: edgedb.Client, conceptIds: ({ [key: string]: any }| undefined))
        : Promise<unknown> {
        const ca = this.serverActions
            .find(sa => id === sa.type + (sa.concept instanceof Array ?
                sa.concept.map(p => helpers.capitalizeFirst(p)).join('') :
                helpers
                    .capitalizeFirst(sa.concept)))
        if (ca) {
            switch (ca.type) {
                case CrudActionType.Get:
                    if (typeof ca.concept === 'string') {
                        const concept = (e as any)[helpers.capitalizeFirst(ca.concept)]
                        const objToSelect = {
                            ...concept['*'],
                            isInList: e.bool(true)
                        }
                        if (ca.calculatedFields) {
                            const calcFields = ca.calculatedFields
                            return await e.select(concept, (r: any) => ({
                                ...concept['*'],
                                isInList: this.constructQueryObject(r.id,calcFields,conceptIds,client)
                            })).run(client)
                        }
                        return e.select(concept, (r: any) => (objToSelect)).run(client)
                    } else throw new Error('concept in crud action not implemented')
                case CrudActionType.GetOne:
                    if (ca.concept instanceof Array && ca.concept.length === 2) {
                        if (ca.filter && typeof ca.filter === 'object' && !(ca.filter instanceof Aggregate)) {
                            const objToSelect: { [key: string]: any } = {}
                            objToSelect[ca.concept[1]] = {id: true}
                            const concept = (e as any)[helpers.capitalizeFirst(ca.concept[0])]
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
                        const key = Object.keys(conceptIds).filter(i=>!ca.concept.includes(i))[0]
                        const conceptUsed = (e as any)[helpers.capitalizeFirst(key)]
                        const instance = e.select(conceptUsed,()=>({
                            filter_single:{id: conceptIds[key]} as any
                        }))
                        setObj[ca.concept[1]] = {"+=": instance}
                        if (ca.filter && typeof ca.filter === 'object' && !(ca.filter instanceof Aggregate)) {
                            e.update((e as any)[mainConcept], (r: any) => ({
                                filter_single: {...ca.filter} as any,
                                set: setObj
                            })).run(client)
                        } else if(conceptIds.length===2){
                            e.update((e as any)[mainConcept], () => ({
                                filter_single: ({id: conceptIds[0]} as unknown) as any,
                                set: setObj
                            })).run(client)
                        } else throw new Error('Ongeldig aantal concept Ids doorgekregen')
                        if (ca.returnValue) {
                            // todo werk recursie weg: dit is een query dus je lost het op door queries en mutation uit elkaar te trekken
                            //      maar uiteindelijk is het beter om gewoon elke actie uit elkaar te trekken
                            return this.executeResponseRequest(ca.returnValue, client, conceptIds)
                        }
                    }
                    throw new Error('concept in crud action mal configurered')
                case CrudActionType.RemoveOneFromList:
                    if (ca.concept instanceof Array && ca.concept.length === 2 && conceptIds) {
                        const mainConcept = helpers.capitalizeFirst(ca.concept[0])
                        const setObj: any = {}
                        setObj[ca.concept[1]] = {"-=": e.uuid(conceptIds[conceptIds.length===2?1:0])}
                        if (ca.filter && typeof ca.filter === 'object' && !(ca.filter instanceof Aggregate)) {
                            // todo zeker checken of dit eigenlijk wel mogelijk is
                            e.update((e as any)[mainConcept], (r: any) => ({
                                filter_single: {...ca.filter} as any,
                                set: setObj
                            })).run(client)
                        } else if(conceptIds.length===2){
                            e.update((e as any)[mainConcept], () => ({
                                filter_single: ({id: conceptIds[0]} as unknown) as any,
                                set: setObj
                            })).run(client)
                        } else throw new Error('Ongeldig aantal concept Ids doorgekregen')
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
    private static constructQueryObject(id: any, calcFields: Object, conceptIds: { [p: string]: any } | undefined,client: edgedb.Client): any {
        // r is het record dat komt van de bovenliggende query in dit geval een film
        let query: any
        let innerQuery: any
        for (const [k, v] of Object.entries(calcFields)) {
            if (v instanceof Aggregate) {
                /*
            *             * e.op(                                             * new Aggregate(AggregateType.Equals
            *   e.count(e.select(                                   ** new Aggregate(AggregateType.CountEquals
            *      myAccount.watchlist, (r)=>({id:true,filter:           *** new CrudActionConstruct(...
                            * e.op(                                         **
                            *   movie.id, =r.id                                      'movie'
                            *   '=',                                            **
                            *   r.id                                            ***
                            * )
                    }))
                ),
            *   '=',                                              *,
            *   1)                                                1
            *
                * */
                switch (v.type) {
                    case AggregateType.Equals:
                        query = e.op
                        const source = v.source
                        const target = v.target
                        if (source instanceof Aggregate) {
                            switch (source.type) {
                                case AggregateType.CountEquals:
                                    const source2 = source.source // niet nodig
                                    const target2 = source.target
                                    if (target2 instanceof CrudActionConstruct && target2.concept instanceof Array && target2.concept.length === 2) {
                                        if (target2.filter && typeof target2.filter === 'object' && !(target2.filter instanceof Aggregate)) {
                                            const objToSelect: { [key: string]: any } = {}
                                            objToSelect[target2.concept[1]] = {id: true}
                                            const concept = (e as any)[helpers.capitalizeFirst(target2.concept[0])]
                                            const innerSelect = (e.select(concept, (
                                                    ri) => ({
                                                    ...objToSelect,
                                                    filter_single: {...target2.filter} as any
                                                })
                                            ) as any)[target2.concept[1]]
                                            innerQuery = e.count(
                                                e.select(
                                                    innerSelect, (rj: any) => ({
                                                        id: true,
                                                        filter:e.op(rj.id,'=',id)
                                                    })
                                                )
                                            )
                                        }
                                    }
                                    break
                            }
                        }
                        query = query(innerQuery, '=', target)
                }
            } else throw new Error('calc fields for QueryActionConstruct not implemented yet')
        }
        return query
    }
}
