
const fs = require("fs")
const axios = require("axios")
const somef = require("../localModules/someFunctions")
const _Database_ = require("../localModules/Database")

let config = {
    maxSimultaneousFetch: 100,
    maxWaitAmount: 30*1000,
}

class new_fetcher {
    constructor(Database, maxSimultaneousFetch) {
        this.Database = Database
        this._startedAt = Date.now()
        this._lastFetchRequest = 0
        this._lastFetchResponse = 0
        this._maxSimultaneousFetch = maxSimultaneousFetch
        this._socket = new somef.Emitter()

        this._running = false
        this._paused = false
        this._killProcess = false

        this._temp = {
            buffer: []
        }
    }

    __init__() {
        console.log("Initializing...")
        this._socket.emit("ready", Date.now())    
        console.log("Done.")
    }

    isRunning() { return this._running }
    isPaused() { return this._paused }
    isKilled() { return this._killProcess }

    getMaxFetchAmount() {
        return this._maxSimultaneousFetch || 100
    }

    _onFetched() {
        if(this.isKilled()) return;
    }

    _startFetchURI() {

    }

    async startProcess() {
        if(this._running) throw new Error("Fetcher already running.")
        this._running = true
        this._paused = false

        console.log("ddf:",this.getMaxFetchAmount())

        let links = await this.Database._makeQuery(`SELECT * FROM links
            ORDER BY (links.lastFetch+links.createdAt+1000*links.fetchCount)
            LIMIT ?
            `, [
                this.getMaxFetchAmount()
            ]
        )
        
        console.log("links:",links)


    }

    pauseProcess() {
        if(!this._running) throw new Error("Fetcher not running.")
        this._running = true
        this._paused = true

    }

    /*
    f(): Stops adding links to fetch list. Finishes fetching the links in buffer list.
    */
    stopProcess() {
        if(!this._running) throw new Error("Fetcher not running.")
        this._running = false
        this._paused = false
    }

    killProcess() {
        if(!this._running) true
        this._killProcess = true

    }




}


console.log("1")
let Fetcher = new new_fetcher(_Database_, config.maxSimultaneousFetch)

Fetcher.__init__()

Fetcher.startProcess()