
/*export const compileCommandsUserConfig = function compileCommandsUserConfig(client:edgedb.Client):CrudAction[]{
// todo maak crudaction config volledig dynamisch sprint2
const crudActions:CrudAction[] = []
    const getAllMovies = async function getAllMovies() {
        // todo add try catch for internal logging => indien fout geprogrammeerd kan dit fout lopen = niet type safe!
        // todo maak dit type safe met behulp van interface generators

        const myAccount = e.select(e.Account,(account)=>({
            id:true,
            watchlist:{id:true},
            filter: e.op(account.username,'=','Pol')
        }));
        // todo andere strategie, je construeert heel de query niet enkel het calcfieldsstuk ?
        return e.select(e.Movie, (movie) => ({
            id: true,
            title: true,
            actors: {name: true},
            release_year: true,
            isInList:e.op(e.count((e.select(myAccount.watchlist,(list)=>({
                id:true,
                // todo dit kan je duidelijk niet scheiden van dat van boven
                filter:e.op(movie.id,'=',list.id)
            })))),'=',1)
    })).run(client)
    }
    crudActions.push(new CrudAction('getAllMovies', getAllMovies))
    const getAllShows = async function getAllShows() {
        return e.select(e.Show, () => ({
            id: true,
            title: true,
            num_seasons:true
        })).run(client)
    }
    crudActions.push(new CrudAction('getAllShows', getAllShows))
    const getAllSeasons = async function getAllSeasons() {
        return e.select(e.Season, () => ({
            id: true,
            number: true,
            show: true,
        })).run(client)
    }
    crudActions.push(new CrudAction('getAllSeasons', getAllSeasons))
    const getAllActors = async function getAllActors() {
        return e.select(e.Person, () => ({
            id: true,
            name: true
        })).run(client)
    }
    crudActions.push( new CrudAction('getAllActors', getAllActors))
    const getAllContent = async function getAllContent() {
        return e.select(e.Content, () => ({
            id: true,
            title: true,
            actors:true,
        })).run(client)
    }
    crudActions.push(new CrudAction('getAllContent', getAllContent))
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
    crudActions.push(new CrudAction('removeMovieFromList', removeMovieFromList))

    const addMovieToList = async function addMovieToList(id:string|undefined) {
        if(id){
            const movie = e.select(e.Movie,(m)=>({
                filter_single: {id: id}
            }))
            e.update(e.Account,(acc)=>({
                filter_single: {username: 'Pol'},
                set: {
                    watchlist: {"+=":movie}
                }

            })).run(client)
            return e.select(e.Movie,(m)=>({
                id: true,
                title: true,
                actors: {name: true},
                release_year: true,
                isInList:e.bool(true),
                message:e.op(e.op(e.str('Film '),'++',m.title),'++',e.str(' is nu aan je lijst toegevoegd')),
                filter_single: {id: id}
            })).run(client)
        }
        return null
    }
    crudActions.push(new CrudAction('addMovieToList', addMovieToList))

    return crudActions
}*/

