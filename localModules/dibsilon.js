

let somef = require("./someFunctions")
const Database = require("./Database")


class Dibsilon {
    constructor() {
        this.Algorithm = {
            copyright: "Dibsilon (c) Sylicium 2022",
            lastVersion: "1.0.0-alpha",
            date: "24/10/2023",
            author: "Sylicium",
        }

        this._GlobalConfig = {
            page: {
                length: 20, // number of links per pages
            }
        }

    }

    get Config() {
        return this._GlobalConfig
    }


    getPageByQuery(pageNum, query) {

    }

    getLinksByQuery(start, end, query) {
        Database._makeQuery(`SELECT * FROM links
        WHERE url REGEXP ?
        LIMIT ?,?
        `, [query, start,end])
    }


}

module.exports = new Dibsilon()