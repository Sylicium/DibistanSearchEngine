
const somef = require("./someFunctions")
const Mariadb = require('mariadb');
const logger = require("./logger")()

/**
 * @description Base de donnée SQL
 * @version 1.0.0
 * @core 1.0.1
 * @date 09/08/2023
 * @author Sylicium
*/


let Temp_ = {
}


class Database {
    constructor() {
        this._Mariadb = Mariadb
        this._Pool = null;
        this._initialized = false

        this.socket = new somef.Emitter()

        /*
        TypeError: Cannot read properties of null (reading 'getConnection')
        -> ajouter __waitForInit__() car la base de donnée n'as pas encore chargée
        */
    }

    async _makeQuery(query, params) {
        await this.__waitForInit__()
        let conn;
        let queryResponse = undefined
        // logger.debug("this._Pool:",this._Pool)
        try {
            conn = await this._Pool.getConnection();

            let queryRes = await conn.query(query, params)

            queryResponse = queryRes
        } catch (err) {
            console.log("error",err)
            throw err;
        } finally {
            if (conn) conn.release()
            return queryResponse
        }
    }

    async __init__() {
        try {
            const pool = await this._Mariadb.createPool({
                host: 'localhost', 
                user:'root',
                password: 'root',
                database: 'dibim',
                connectionLimit: 100
            })
            this._Pool = await pool
            this._initialized = true
    
            this.socket.emit('ready', (
                true
            ))
        } catch(e) {
            logger.error(e)
            this.socket.emit('ready', (
                false,
                e
            ))
            console.log(e)
        }
        console.log("init this._Pool2:",this._Pool)
    }

    async __waitForInit__() {
        if(this._initialized) {
            return true
        } else {
            await somef.sleep(10);
            return this.__waitForInit__()
        }
    }

    __get__() { return this }

}

console.log
let Database_ = new Database()

module.exports = Database_

Database_.__init__()


Database_.socket.on("ready", (status, error) => {
    if(error) throw error
    if(!status) return console.log("ready status not ok.")
    console.log("Database loaded.")
})