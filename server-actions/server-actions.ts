import {CrudAction} from "./crudactions/crud-action";
import {ActionIdType} from "../types/aliases";
import helpers from "../helpers/general-helpers"
import {CrudActionType} from "../enums/crud-actions.enum";
import e from "./../dbschema/edgeql-js"
import {SelectFilterExpression} from "../dbschema/edgeql-js/select";
import * as edgedb from "edgedb";

export class ServerActions {
    private static serverActions: CrudAction[] = []

    public static addAction(action: CrudAction) {
        this.serverActions.push(action)
    }
    //|[Promise<unknown>,any]
    public static executeAction(id: ActionIdType, client: edgedb.Client,conceptIds:string|[string,string])
        :  Promise<unknown>{
        const ca = this.serverActions.find(sa => id === sa.type + helpers
            .capitalizeFirst(sa.concept instanceof Array ? sa.concept.map(p => helpers.capitalizeFirst(p)).join() : sa.concept))
        if (ca) {
            switch (ca.type) {
                case CrudActionType.Get:
                    if (typeof ca.concept === 'string') {
                        const concept = (e as any)[ca.concept]
                            return e.select(concept, () => ({
                                ...concept['*']
                            })).run(client)
                    } else throw new Error('concept in crud action mal configurered')
                case CrudActionType.AddOneToList:
                    if (ca.concept instanceof Array && ca.concept.length === 2) {
                        const mainConcept = ca.concept[0]
                        const setObj: any = {}
                        if (ca.returnValue) {
                                if (conceptIds instanceof Array) {
                                    setObj[ca.concept[1]] = {"+=": conceptIds[1]}
                                    e.update((e as any)[mainConcept], () => ({
                                        filter_single: ({id: conceptIds[0]} as unknown) as SelectFilterExpression,
                                        set: setObj
                                    })).run(client)
                                } else if (ca.filter) {
                                    setObj[ca.concept[1]] = {"+=": conceptIds}
                                    e.update((e as any)[mainConcept], () => ({
                                        filter_single: (ca.filter) as SelectFilterExpression,
                                        set: setObj
                                    })).run(client)
                                }
                            return this.executeAction(ca.type+helpers.capitalizeFirst(ca.concept.map(p => helpers.capitalizeFirst(p)).join()),client,conceptIds)
                        }
                            if (conceptIds instanceof Array) {
                                setObj[ca.concept[1]] = {"+=": conceptIds[1]}
                                return e.update((e as any)[mainConcept], () => ({
                                    filter_single: ({id: conceptIds[0]} as unknown) as SelectFilterExpression,
                                    set: setObj
                                })).run(client)
                            } else if (ca.filter) {
                                setObj[ca.concept[1]] = {"+=": conceptIds}
                                return e.update((e as any)[mainConcept], () => ({
                                    filter_single: (ca.filter) as SelectFilterExpression,
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
                                        filter_single: ({id: conceptIds[0]} as unknown) as SelectFilterExpression,
                                        set: setObj
                                    })).run(client)
                                } else if (ca.filter) {
                                    setObj[ca.concept[1]] = {"-=": conceptIds}
                                    e.update((e as any)[mainConcept], () => ({
                                        filter_single: (ca.filter) as SelectFilterExpression,
                                        set: setObj
                                    })).run(client)
                                }
                                return this.executeAction(ca.type+helpers.capitalizeFirst(ca.concept.map(p => helpers.capitalizeFirst(p)).join()),client,conceptIds)
                            }
                            if (conceptIds instanceof Array) {
                                setObj[ca.concept[1]] = {"-=": conceptIds[1]}
                                return e.update((e as any)[mainConcept], () => ({
                                    filter_single: ({id: conceptIds[0]} as unknown) as SelectFilterExpression,
                                    set: setObj
                                })).run(client)
                            } else if (ca.filter) {
                                setObj[ca.concept[1]] = {"-=": conceptIds}
                                return e.update((e as any)[mainConcept], () => ({
                                    filter_single: (ca.filter) as SelectFilterExpression,
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
