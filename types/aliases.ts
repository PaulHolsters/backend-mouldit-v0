export type ActionIdType = string
export type Data = {data:DataRecord|List,error:MoulditError}
export type DataRecord= {
    [key:string]: List|DataRecord|RenderPropertyType|RenderPropertyTypeList<RenderPropertyType>
} & {
    id: string
}
export type List = Array<DataRecord>
export type RenderPropertyType = (boolean|number|Date|string)& {
    branded_type: 'renderpropertype'
}
export const isRenderPropertyType = function isRenderPropertyType(data:unknown):data is RenderPropertyType{
    return typeof data === 'string' || typeof data === 'number' || data instanceof Date ||typeof data === 'boolean'
}
export type RenderPropertyTypeList<K> =
    K extends boolean ? boolean[] :
        K extends string ? string[] :
            K extends Date ? Date[] :
                K extends number ? number[]: never
export const isDataRecord = function isDataRecord(data:unknown):data is DataRecord{
    // todo voeg controle toe betreffende de andere properties rekening houdende met het feit dat hier geen restricties
    //      bestaan op hoe diep je kan nesten
    return data!==null && typeof data === 'object' && !(data instanceof Array) && 'id' in data
}
export const isList = function isList(data:unknown):data is List{
    return (data instanceof Array) && (data.length===0 || isDataRecord(data[0]))
}
export type MoulditError = {
    code:number,
    message:string,
    type:MoulditErrorType
}
export type MoulditErrorType =
    'no connection with database'|
    'Mouldit has an error that needs to be fixed'|
    'validation'
