

console.log("1")
const fs = require("fs")
const axios = require("axios")
const somef = require("../localModules/someFunctions")
const _Database_ = require("../localModules/Database")
const robotsParser = require('robots-parser');

let config = {
    maxSimultaneousFetch: 100,
    maxWaitAmount: 30*1000,
}

class new_fetcher {
    constructor(Database, maxSimultaneousFetch=100) {
        this.Database = Database
        this._startedAt = Date.now()
        this._lastFetchRequest = 0
        this._lastFetchResponse = 0
        this._maxSimultaneousFetch = maxSimultaneousFetch
        this._socket = new somef.Emitter()

        this._UserAgent = `DibsilonCrawler/0.1.0 (https://search.sylicium.fr/ for more infos)`
        this._defaultTitle = "No title"
        this._axiosRequestOptions = {
            headers: {
                'User-Agent': this._UserAgent
            }
        }
        this._maxFetchedIDSBufferSize = maxSimultaneousFetch*3
        this._continueProcessBufferLimit = 50 // Minimum amount to not fetch again links
        this._continueProcessFetchChunkSize = 50 // If continueProcessBuffer is under its limit, fetching that chunck size of links

        this._running = false
        this._paused = false
        this._killProcess = false

        this._temp = {
            buffer: [],
            robotTXT: {},
            fetchersRunning: 0,
            fetchedIDSBuffer: [],
            waitingToFetch: []
        }
    }

    __init__() {
        console.log("Initializing...")
        this._socket.emit("ready", Date.now())    
        console.log("Done.")

        this._socket.on("releaseFetcher", () => {
            if(this._temp.fetchersRunning <= 0) {
                console.log(`[Fetcher][WARN] Invalid release command, ${this._temp.fetchersRunning} fetchers currently running. Cannot release one more. Ignoring.`)
                this._temp.fetchersRunning = 0
            } else {
                this._temp.fetchersRunning = this._temp.fetchersRunning - 1
            }
        })
    }

    _getAxiosOptions() { return this._axiosRequestOptions }

    _getDefaultTitle() { return this._defaultTitle }
    _getContinueProcessBufferLimit() { return this._continueProcessBufferLimit }
    _getContinueProcessFetchChunkSize() { return this._continueProcessFetchChunkSize }
    _getFirstWaitingLinkInBuffer() {
        if(this._temp.waitingToFetch.length == 0) {
            throw Error(`[Fetcher][ERROR] Fatal error: Waiting links to fetch buffer is empty !`)
        }
        let link = this._temp.waitingToFetch.shift()
        return link
    }

    async _getRobotTxTFromURI(uri) {
        try {
            let domain = uri.match(/https?:\/\/([^/]+)\//)[1];
            if(this._temp.robotTXT.hasOwnProperty(domain)) { return this._temp.robotTXT[domain] };
            let robot_uri = `https://${domain}/robots.txt`
            console.log(`[Fetcher] RobotTXT: axios getting ${robot_uri}`)
            let robot_response = await axios.get(robot_uri, this._getAxiosOptions());
            this._temp.robotTXT[domain] = robot_response.data;
            return robot_response.data;
        } catch(e) {
            return ""
        }
    }

    _isRunning() { return this._running }
    _isPaused() { return this._paused }
    _isKilled() { return this._killProcess }

    _getMaxFetchAmount() {
        return this._maxSimultaneousFetch
    }

    _addFetchingID(id) {
        this._temp.fetchedIDSBuffer.push(id)
        if(this._temp.fetchedIDSBuffer.length >= this._maxFetchedIDSBufferSize) this._temp.fetchedIDSBuffer.shift()
    }
    _canUseFetcher() {
        if(this._temp.fetchersRunning > this._getMaxFetchAmount()) return false
        return true
    }
    _useFetcher() { this._temp.fetchersRunning += 1 }

    _getFetchingIDSBuffer() {
        return this._temp.fetchedIDSBuffer
    }

    async _extractTitle(html_text) {
        const regex = /<title>(.*?)<\/title>/g;
        const match = regex.exec(html_text);
        let titleContent = this._getDefaultTitle()
        if (match) {
          titleContent = match[1];
        }
        return titleContent.length > 1 ? titleContent : this._getDefaultTitle()
    }

    async _extractLinks(html_text) {
        try {
      
          // Utiliser une regex pour extraire les liens
          const linkRegex = /<a\s+(?:[^>]*?\s+)?href="([^"]*)"/g;
          const links = [];
          let match;

          while ((match = linkRegex.exec(html_text)) !== null) {
            const link = match[1];
            links.push(link);
          }
      
          return links;
        } catch (error) {
          console.error('Une erreur s\'est produite :', error);
          return null;
        }
    }

    

    async _filterLinksByRobotTXT(links, uri) {
        let robotsTxtContent = await this._getRobotTxTFromURI(uri)
        if (!robotsTxtContent) return links;

        const robots = robotsParser(`${siteUrl}/robots.txt`, robotsTxtContent);
        let filteredLinks = [];

        for (const link of links) {
            const parsedLink = url.parse(link);
            if (robots.isAllowed(parsedLink.pathname, this._UserAgent)) {
                // Le lien est autorisé
                filteredLinks.push(link);
            }
        }

        return filteredLinks;
    }


    async _onFetched(axiosResponse) {
        if(this.isKilled()) return;

        let new_links = this._extractLinks(axiosResponse.data)
        let filteredLinks = await this._filterLinksByRobotTXT(new_links, axiosResponse.config.url)

        /* id, title, uri, createdAt, lastFetch, fetchCount` */

        // La requête SQL d'insertion de base
        let sqlQuery = `INSERT INTO 
            links (title, uri, createdAt, lastFetch, fetchCount)
        VALUES`;
        
        // Les valeurs à insérer dans la base de données
        const valuesToInsert = [];
        
        // Boucle pour construire la requête et les valeurs
        for (let i in filteredLinks) {
            const link = filteredLinks[i];
            const createdAt = Date.now();

            if (i > 0) { sqlQuery += ',' }
            
            sqlQuery += ' (?, ?, ?, 0, 0)';
            valuesToInsert.push(this._getDefaultTitle(), link, createdAt);
        }
        // Compléter la requête
        sqlQuery += ';';
        
        this.Database._makeQuery(sqlQuery, valuesToInsert)

        this._continueProcess()
    }

    _startFetchURI(datas) {
        console.log(`[Fetcher] Start fetch of '${datas.id}' (${datas.uri.substr(0,100)}${datas.length > 100 ? "..." : ""}) `)

        
        axios.get(datas.uri, this._getAxiosOptions()).then((response) => {
            
            let titleContent = this._extractTitle()

            this.Database._makeQuery(`UPDATE links
            SET
                lastFetch=?
                fetchCount=?
                title=?
                `, [
                    Date.now(),
                    datas.fetchCount + 1,
                    titleContent
                ]
            )
            
            this._onFetched(response)
            
        }).catch(e => {
            this.Database._makeQuery(`UPDATE links
            SET
                lastFetch=?
                fetchCount=?
                `, [
                    Date.now(),
                    datas.fetchCount + 1
                ])
        })
    }

    async startProcess() {
        if(this._isRunning()) throw new Error("Fetcher already running.")
        this._running = true
        this._paused = false

        let links = await this.Database._makeQuery(`SELECT * FROM links
            ORDER BY (links.lastFetch + links.createdAt  + 1000 * links.fetchCount)
            LIMIT ?
            `, [
                this._getMaxFetchAmount()
            ]
        )

        for(let i in links) {
            let link = links[i]
            this._addFetchingID(link.id)
            this._startFetchURI(link)
        }
    }


    async _continueProcess() {
        if(this._temp.waitingToFetch.length < this._getContinueProcessLimit()) {
            let links = await this.Database._makeQuery(`SELECT * FROM links
                ORDER BY (links.lastFetch + links.createdAt  + 1000 * links.fetchCount)
                LIMIT ?
                `, [
                    this._getContinueProcessFetchChunkSize()
                ]
            )
            this._temp.waitingToFetch.push(...links)
        }

        if(this._canUseFetcher()) {
            this._useFetcher()
            this._startFetchURI(this._getFirstWaitingLinkInBuffer())
        }
    }

    pauseProcess() {
        if(!this._isRunning()) throw new Error("Fetcher not running.")
        this._running = true
        this._paused = true

    }

    /*
    f(): Stops adding links to fetch list. Finishes fetching the links in buffer list.
    */
    stopProcess() {
        if(!this._isRunning()) throw new Error("Fetcher not running.")
        this._running = false
        this._paused = false
    }

    killProcess() {
        if(!this._isRunning()) return true
        this._killProcess = true

    }




}


console.log("1")
let Fetcher = new new_fetcher(_Database_, config.maxSimultaneousFetch)

Fetcher.__init__()

Fetcher.startProcess()