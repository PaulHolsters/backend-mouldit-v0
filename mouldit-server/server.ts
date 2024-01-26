import express, {Request, Response, Application} from 'express';
import {ServerActions} from "../server-actions/server-actions";
import * as edgedb from "edgedb";
import http from "http";

const bodyParser = require('body-parser')

const client = edgedb.createClient()
client.ensureConnected().then(() => {
/*        compileCommandsUserConfig(client).forEach(c => {
            ServerActions.addAction(c)
        })*/
        const server = express()
        server.use(bodyParser.urlencoded({extended: false}))
        server.use(bodyParser.json())
        server.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*')
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
            if (req.method === 'OPTIONS') {
                res.header('Access-Control-Allow-Methods', 'POST, GET')
                return res.status(200).json({})
            }
            next()
        })
        server.post('/:actionId', (req: Request, res: Response, next) => {
            const result = ServerActions.executeAction(req.params.actionId,client,req.body?.id)
            if (result) {
                        res.status(200).send(result)
            } else res.status(500)
        })
        const port = Number(process.env.PORT || 5000)
        http.createServer(server).listen(port)
    }
).catch(e => {
    console.log(e)
    throw new Error('could not connect to EdgeDB')
})

