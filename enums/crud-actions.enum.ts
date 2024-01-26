export enum CrudActionType {
    // SIMPLE CRUD
    Custom='custom',
    Get = 'get',
    // zonder filtering betekent dit alle records
    GetSpecific = 'getSpecific',
    // deze actie verwacht een lijst van Id's , er kan een condition en/of filtering meegegeven worden
    GetOne = 'getOne',
    // welke filtering je ook doet, er wordt maximaal 1 record teruggegeven
    // voor getOne kan je een condition meegeven indien daaraan niet wordt voldaan, dan wordt er niets teruggeven
    // indien je een filtering meegeeft wordt een eventueel id in de parameters genegeerd
    // zonder filtering wordt gezocht op id die de frontend moet meegeven als parameter
    // deze id komt automatisch binnen onder het desbetreffende concept in "concept" parameter
    CreateOne = 'createOne',
    // er kan maximaal 1 record aangemaakt worden
    Create = 'create',
    // elk record in de body wordt aangemaakt
    Update = 'update',
    // zonder filter wordt elk record geüpdatet, anders diegene die aan de filtering voldoen
    UpdateSpecific = 'updateSpecific',
    // deze actie verwacht een lijst van Id's , er kan een condition en/of filtering meegegeven worden
    UpdateOne = 'updateOne',
    // maximaal 1 record wordt geüpdatet en geen enkel indien aan een meegegeven conditie niet wordt voldaan
    // idem dito hier: indien geen filtering, dan op id anders enkel op filtering
    Delete = 'delete',
    // zonder filter wordt elk record verwijderd, anders diegene die aan de filtering voldoen
    DeleteSpecific = 'deleteSpecific',
    // deze actie verwacht een lijst van Id's , er kan een condition en/of filtering meegegeven worden
    DeleteOne = 'deleteOne',
    // maximaal 1 record wordt verwijderd en geen enkel indien aan een meegegeven conditie niet wordt voldaan
    // idem dito hier: indien geen filtering, dan op id anders enkel op filtering

    // ADVANCED CRUD
    RemoveOneFromList = 'removeOneFromList',
    RemoveFromList = 'removeFromList',
    ClearList = 'clearList',
    AddOneToList = 'addOneToList',
    AddToList = 'addToList',
}
