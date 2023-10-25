
/**
 * @author Sylicium
 * @version 2.4.0
 * @date 25/10/2023
 */


const fs = require("fs")
const axios = require("axios")
const somef = require("../localModules/someFunctions")
const _Database_ = require("../localModules/Database")
const robotsParser = require('robots-parser');

let config = {
    maxSimultaneousFetch: 10,
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

        this._startedTimestamp = 0;
        this._running = false
        this._paused = false
        this._killProcess = false

        this._temp = {
            buffer: [],
            robotTXT: {},
            fetchersRunning: 0,
            fetchedIDSBuffer: [], // The ones currently fetched, or fetched recently. Prevents multiple Fetchers to fetch same links
            waitingToFetch: [], // links waiting to be fetched. Filtered by fetchedIDSBuffer
            isFetchingMoreLinksToWait: false
        }

        this._stats = {
            fetchedLinks: 0,
            newScrappedLink:0
        }
    }

    _getLogPrefix(type="info") {
        let time = somef.formatTime(Date.now() - this._startedTimestamp, `hh:mm:ss.ms`)
        return `[Fetcher][${time}][${`${this._stats.fetchedLinks}`.padStart(9, " ")} fetch | ${`${this._stats.newScrappedLink}`.padStart(12, " ")} added | ${`${this._temp.waitingToFetch.length}`.padStart(3, " ")} waiting][${type.toUpperCase().padEnd(5," ")}]`
    }
    _statsAddFetchedLink(amount=1) {
        if(typeof amount != 'number') { throw new Error("Invalid data type. Expected Number")}
        this._stats.fetchedLinks += amount
    }
    _statsAddScrappedLink(amount=1) {
        if(typeof amount != 'number') { throw new Error("Invalid data type. Expected Number")}
        this._stats.fetchedLinks += amount
    }

    __init__() {
        setInterval(() => {
            //console.log("temp:",this._temp)
        }, 1000)
        console.log("Initializing...")
        this._socket.emit("ready", Date.now())    
        console.log("Done.")
    }

    _getAxiosOptions() { return this._axiosRequestOptions }
    _getDomainFromURI(uri) {
        console.log(`${this._getLogPrefix()}[DEBUG] _getDomainFromURI: ${uri}`)
        return uri.match(/https?:\/\/([^/]+)\//)[1];
    }

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
            let domain = this._getDomainFromURI(uri)
            if(this._temp.robotTXT.hasOwnProperty(domain)) { return this._temp.robotTXT[domain] };
            let robot_uri = `https://${domain}/robots.txt`
            console.log(`${this._getLogPrefix()} RobotTXT: axios getting ${robot_uri}`)
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
    FetchingIDSBuffer() {
        return this._temp.fetchedIDSBuffer
    }



    _getFetchersRunningAmount() { return this._temp.fetchersRunning }
    _canUseFetcher() {
        if(this._temp.fetchersRunning > this._getMaxFetchAmount()) return false
        return true
    }
    _getFreeFetchersAmount() {
        if(!this._canUseFetcher()) return 0
        return this._getMaxFetchAmount() - this._getFetchersRunningAmount()
    }
    _useFetcher() { this._temp.fetchersRunning += 1 }
    _releaseFetcher() {
        if(this._getFetchersRunningAmount() <= 0) {
            console.log(`${this._getLogPrefix()}[WARN] Invalid release command, ${this._getFetchersRunningAmount()} fetchers currently running. Cannot release one more. Ignoring.`)
            this._temp.fetchersRunning = 0
        } else {
            this._temp.fetchersRunning = this._temp.fetchersRunning - 1
        }
    }

    _extractTitle(html_text) {
        const regex = /<title>(.*?)<\/title>/gi;
        const match = regex.exec(html_text);
        let titleContent = this._getDefaultTitle()
        if (match) {
            titleContent = match[1];
        }
        return titleContent.length > 1 ? titleContent : this._getDefaultTitle()
    }
    _extractP(html_text) {
        const regex = /<p[^>]*>(.*?)<\/p>/gis;
        const matches = [];

        let match;
        while ((match = regex.exec(html_text)) !== null) {
            const paragraphContent = match[1];
            matches.push(paragraphContent);
        }
        return matches
    }

    _extractLinks(html_text) {
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
            console.error(`${this._getLogPrefix()} Une erreur s\'est produite :`, error);
            return null;
        }
    }

    

    async _filterLinksByRobotTXT(links, uri) {
        let robotsTxtContent = await this._getRobotTxTFromURI(uri)
        if (!robotsTxtContent) return links;

        const robots = robotsParser(`https://${this._getDomainFromURI(uri)}/robots.txt`, robotsTxtContent);
        let filteredLinks = [];

        for (let i in links) {
            let link = links[i]
            const parsedLink = url.parse(link);
            if (robots.isAllowed(parsedLink.pathname, this._UserAgent)) {
                // Le lien est autorisé
                filteredLinks.push(link);
            }
        }

        return filteredLinks;
    }

    _filterWrongLinks(links) {
        let new_links = []
        for(let i in links) {
            let link = links[i]
            if(link.startsWith("http")) { new_links.push(link) }
            else if(link.startsWith("/")) { new_links.push(link) }
        }
        return new_links
    }
    _filterTooLongLinks(links) {
        return links.filter(x => {
            return x.length <= 512
        })
    }


    _rebuildRelativePath(domain, links) {
        let new_links = []
        for(let i in links) {
            let link = links[i]
            if(link.startsWith("http")) { new_links.push(link) }
            else if(link.startsWith("/")) {
                new_links.push(`https://${domain}${link}`)
            }
        }
        return new_links
    }

    async _onFetched(axiosResponse) {
        if(this._isKilled()) return;

        let new_links = this._extractLinks(axiosResponse.data)
        let temp_filter = this._filterWrongLinks(new_links)
        let temp_filter2 = this._filterTooLongLinks(temp_filter)
        let temp_filter3 = this._rebuildRelativePath(this._getDomainFromURI(axiosResponse.config.url), temp_filter2)
        let filteredLinks = temp_filter3 // await this._filterLinksByRobotTXT(new_links, axiosResponse.config.url)

        
        this._statsAddScrappedLink(filteredLinks.length)

        //console.log("new_links:",new_links)
        //console.log("filteredLinks:",filteredLinks)

        if(filteredLinks.length > 0) {
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
            //console.log("valuesToInsert:",valuesToInsert)
            sqlQuery += ';';
            
            this.Database._makeQuery(sqlQuery, valuesToInsert)
        }
        this._continueProcess()
    }

    _startFetchURI(datas) {
        this._useFetcher()
        console.log(`${this._getLogPrefix()} Start fetch of ID=${datas.id} (${datas.uri.substr(0,100)}${datas.length > 100 ? "..." : ""}) `)

        
        axios.get(datas.uri, this._getAxiosOptions()).then((response) => {
            this._releaseFetcher()
            this._statsAddFetchedLink(1)
            console.log(`${this._getLogPrefix()} Success for ID=${datas.id}`)
            
            let titleContent = this._extractTitle(response.data)

            this.Database._makeQuery(`UPDATE links
            SET
                lastFetch=?,
                fetchCount=?,
                title=?
            WHERE id=?`, [
                    Date.now(),
                    datas.fetchCount + 1,
                    titleContent,
                    datas.id,
                ]
            )
            
            this._onFetched(response)
            
        }).catch(e => {
            this._releaseFetcher()
            console.log(`${this._getLogPrefix()} Error: ${e}`)
            this.Database._makeQuery(`UPDATE links
            SET
                lastFetch=?,
                fetchCount=?
                WHERE id=?`, [
                    Date.now(),
                    datas.fetchCount + 1,
                    datas.id,
                ])
        })
    }

    async startProcess() {
        if(this._isRunning()) throw new Error("Fetcher already running.")
        this._startedTimestamp = Date.now()
        this._running = true
        this._paused = false

        let links = await this.Database._makeQuery(`SELECT * FROM links
            ORDER BY (links.lastFetch + links.createdAt  + 1000 * links.fetchCount)
            LIMIT ?`, [
                this._getMaxFetchAmount()
            ]
        )

        if(links.length == 0) {
            throw new Error("Not links to fetch from database.")
        }

        for(let i in links) {
            let link = links[i]
            this._addFetchingID(link.id)
            this._startFetchURI(link)
        }
    }


    async _continueProcess() {
        console.log(`${this._getLogPrefix()} Continuing.. (${this._temp.fetchersRunning} / ${this._getMaxFetchAmount()} fetchers online)`)
        if(this._temp.waitingToFetch.length < this._getContinueProcessBufferLimit() && !this._temp.isFetchingMoreLinksToWait) {
            this._temp.isFetchingMoreLinksToWait = true
            console.log(`${this._getLogPrefix()}   Fetching more links to wait..`)
            let links = await this.Database._makeQuery(`SELECT * FROM links
                ORDER BY (links.lastFetch + links.createdAt  + 1000 * links.fetchCount)
                LIMIT ?
                `, [
                    this._getContinueProcessFetchChunkSize()
                ]
            )
            this._temp.isFetchingMoreLinksToWait = false
            console.log(`${this._getLogPrefix()}   Fetched ${links.length} more links to wait..`)
            this._temp.waitingToFetch.push(...links)
        }

        for(let i=0;i < this._getFreeFetchersAmount(); i++) {
            if(this._canUseFetcher()) {
                this._startFetchURI(this._getFirstWaitingLinkInBuffer())
            } else {
                this._retryStartFetchURI()
            }
        }

    }

    async _retryStartFetchURI() {
        await somef.sleep(500)
        if(this._canUseFetcher()) { this._startFetchURI(this._getFirstWaitingLinkInBuffer()) }
        await somef.sleep(500)
        if(this._canUseFetcher()) { this._startFetchURI(this._getFirstWaitingLinkInBuffer()) }
        await somef.sleep(2000)
        if(this._canUseFetcher()) { this._startFetchURI(this._getFirstWaitingLinkInBuffer()) }
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


let Fetcher = new new_fetcher(_Database_, config.maxSimultaneousFetch)

Fetcher.__init__()

Fetcher.startProcess()