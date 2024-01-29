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
            return ca.type + helpers.capitalizeFirst(ca.concept.map(p => helpers.capitalizeFirst(p)).join())
        }
        return ca.type + helpers.capitalizeFirst(ca.concept)
    }

    private static getIdForConcept(concept: string, conceptIds: { [key: string]: any }): string {
        return (conceptIds as { [key: string]: any })[concept]
    }

    private static async resolveAggregate(a: Aggregate, conceptIds: { [key: string]: any }, client: edgedb.Client): Promise<boolean | number> {
        let source: Aggregate | string | boolean | number = a.source
        const target = a.target
        switch (a.type) {
            case AggregateType.Equals:
                if (source instanceof Aggregate) {
                    source = await this.resolveAggregate(source, conceptIds, client)
                    if (typeof source === 'number' && typeof target === 'number') return source === target
                }
                throw new Error('possibility not implemented')
            case AggregateType.CountEquals:
                if (typeof source === 'string' && target instanceof CrudAction) {
                    const sourceCt = source
                    const actionId: string = this.constructId(target)
                    // het gaat om een getOne actie namelijk de lijst van Pol ophalen
                    const result = await this.executeAction(actionId, client, conceptIds)
                    if (result instanceof Array) {
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

    public static executeAction(id: ActionIdType, client: edgedb.Client, conceptIds: { [key: string]: any })
        : Promise<unknown> {
        const ca = this.serverActions
            .find(sa => id === sa.type + helpers
                .capitalizeFirst(sa.concept instanceof Array ?
                    sa.concept.map(p => helpers.capitalizeFirst(p)).join() :
                    sa.concept))
        if (ca) {
            switch (ca.type) {
                case CrudActionType.Get:
                    if (typeof ca.concept === 'string') {
                        const concept = (e as any)[ca.concept]
                        const objToSelect = {
                            ...concept['*'],
                        }
                        if (ca.calculatedFields) {
                            Object.entries(ca.calculatedFields).forEach(([k, v]: any) => {
                                if (v instanceof Aggregate) {
                                    // todo werk recursie weg
                                    objToSelect[k] = this.resolveAggregate(v, conceptIds, client)
                                }
                            })
                        }
                        return e.select(concept, () => (objToSelect)).run(client)
                    } else throw new Error('concept in crud action not implemented')
                case CrudActionType.GetOne:
                    if(ca.concept instanceof Array && ca.concept.length===2){
                        if(ca.filter && typeof ca.filter === 'object' && !(ca.filter instanceof Aggregate)){
                            const filter:any = {...ca.filter}
                            const objToSelect: { [key: string]: any }={}
                            objToSelect[ca.concept[1]] = {id:true}
                            const concept = (e as any)[ca.concept[0]]
                            const filterProp = Object.keys(filter)[0]
                            // todo zeker checken of dit eigenlijk wel mogelijk is
                            return e.select(concept,(r:any)=>({
                                ...objToSelect,
                                filter: e.op(r[filterProp],'=',filter[filterProp])
                            })).run(client)
                        }
                    }
                    throw new Error('concept in crud action not implemented')
                case CrudActionType.AddOneToList:
                    if (ca.concept instanceof Array && ca.concept.length === 2) {
                        const mainConcept = ca.concept[0]
                        const setObj: any = {}
                        setObj[ca.concept[1]] = {"+=": conceptIds[ca.concept[1]]}
                        if (ca.filter) {
                            e.update((e as any)[mainConcept], () => ({
                                filter_single: (ca.filter) as any,
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
                    if (ca.concept instanceof Array && ca.concept.length === 2) {
                        const mainConcept = ca.concept[0]
                        const setObj: any = {}
                        setObj[ca.concept[1]] = {"-=": conceptIds[ca.concept[1]]}
                        if (ca.filter) {
                            e.update((e as any)[mainConcept], () => ({
                                filter_single: (ca.filter) as any,
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
