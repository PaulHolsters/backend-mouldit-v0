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

    public static executeAction(id: ActionIdType, client: edgedb.Client, conceptIds: {} | {}[])
        : Promise<unknown> {
        function resolveAggregate(a: Aggregate, conceptIDs: {} | {}[]): boolean | number {
            let source: Aggregate | string | boolean | number = a.source
            const target = a.target
            switch (a.type) {
                case AggregateType.Equals:
                    if (source instanceof Aggregate) {
                        source = resolveAggregate(source, conceptIDs)
                        if (typeof source === 'number' && typeof target === 'number') return source === target
                    }
                    throw new Error('possibility not implemented')
                case AggregateType.CountEquals:
                    if(typeof source === 'string' && target instanceof CrudAction){

                    }
                default:
                    throw new Error('aggregate type' + a.type + ' not implemented')
            }
        }
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
                                    objToSelect[k] = resolveAggregate(v, conceptIds)
                                }
                            })
                        }
                        return e.select(concept, () => (objToSelect)).run(client)
                    } else throw new Error('concept in crud action mal configurered')
                case CrudActionType.GetOne:
                // todo dit is voor de return waarde van the lijst bewerking acties

                case CrudActionType.AddOneToList:
                    if (ca.concept instanceof Array && ca.concept.length === 2) {
                        const mainConcept = ca.concept[0]
                        const setObj: any = {}
                        if (ca.returnValue) {
                            if (conceptIds instanceof Array) {
                                setObj[ca.concept[1]] = {"+=": conceptIds[1]}
                                e.update((e as any)[mainConcept], () => ({
                                    filter_single: ({id: conceptIds[0]} as unknown) as any,
                                    set: setObj
                                })).run(client)
                            } else if (ca.filter) {
                                setObj[ca.concept[1]] = {"+=": conceptIds}
                                e.update((e as any)[mainConcept], () => ({
                                    filter_single: (ca.filter) as any,
                                    set: setObj
                                })).run(client)
                            }
                            return this.executeAction(ca.type + helpers.capitalizeFirst(ca.concept.map(p => helpers.capitalizeFirst(p)).join()), client, conceptIds)
                        }
                        if (conceptIds instanceof Array) {
                            setObj[ca.concept[1]] = {"+=": conceptIds[1]}
                            return e.update((e as any)[mainConcept], () => ({
                                filter_single: ({id: conceptIds[0]} as unknown) as any,
                                set: setObj
                            })).run(client)
                        } else if (ca.filter) {
                            setObj[ca.concept[1]] = {"+=": conceptIds}
                            return e.update((e as any)[mainConcept], () => ({
                                filter_single: (ca.filter) as any,
                                set: setObj
                            })).run(client)
                        }
                    }
                    throw new Error('concept in crud action mal configurered')
                case CrudActionType.RemoveOneFromList:
                    if (ca.concept instanceof Array && ca.concept.length === 2) {
                        const mainConcept = ca.concept[0]
                        const setObj: any = {}
                        if (ca.returnValue) {
                            if (conceptIds instanceof Array) {
                                setObj[ca.concept[1]] = {"-=": conceptIds[1]}
                                e.update((e as any)[mainConcept], () => ({
                                    filter_single: ({id: conceptIds[0]} as unknown) as any,
                                    set: setObj
                                })).run(client)
                            } else if (ca.filter) {
                                setObj[ca.concept[1]] = {"-=": conceptIds}
                                e.update((e as any)[mainConcept], () => ({
                                    filter_single: (ca.filter) as any,
                                    set: setObj
                                })).run(client)
                            }
                            return this.executeAction(ca.type + helpers.capitalizeFirst(ca.concept.map(p => helpers.capitalizeFirst(p)).join()), client, conceptIds)
                        }
                        if (conceptIds instanceof Array) {
                            setObj[ca.concept[1]] = {"-=": conceptIds[1]}
                            return e.update((e as any)[mainConcept], () => ({
                                filter_single: ({id: conceptIds[0]} as unknown) as any,
                                set: setObj
                            })).run(client)
                        } else if (ca.filter) {
                            setObj[ca.concept[1]] = {"-=": conceptIds}
                            return e.update((e as any)[mainConcept], () => ({
                                filter_single: (ca.filter) as any,
                                set: setObj
                            })).run(client)
                        }
                    }
                    throw new Error('concept in crud action mal configurered')
                default:
                    throw new Error('Crudaction type not implemented')
            }
        } else throw new Error('bad request')
    }
}
