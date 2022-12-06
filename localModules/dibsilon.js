

const { info } = require("console")
const { devNull } = require("os")
let somef = require("./someFunctions")


class Dibsilon {
    constructor() {
        this.Algorithm = {
            copyright: "Dibsilon (c) Sylicium 2022",
            lastVersion: "0.2.0-alpha",
            date: "02/12/2022",
            developer: "Sylicium",
        }        

    }

    sortByQuery(query, allDBObjects) {

    }

    _getKeywordsMatchRegex_fromQuery(query) {
        console.log("AEJGF query:",query)
        let keywordList = query.toLowerCase().split(" ").map(x => { return x.trim() })
        let keywordList_formatedString = somef._normalize(keywordList.join(" "))
        let all_keywords_matchRegex_preTemp = `(${somef.splitAndJoin(keywordList_formatedString, {
            "\\": "\\\\", "|": "\\|", "/": "\\/",
            "-": "\\-", "_": "\\_", "$": "\\$",
            "[": "\\[", "]": "\\]", "(": "\\(",
            ")": "\\)", "{": "\\{", "}": "\\}",
            "?": "\\?", "*": "\\*", "+": "\\+",
            ",": "\\,", "^": "\\^", ":": "\\:",
            "<": "\\<", ">": "\\>", "'": "\\'",
            '"': '\\"', "#": "\\#",
        }).split(" ").join("|")})`
        let all_keywords_matchRegex = new RegExp(all_keywords_matchRegex_preTemp, "i")
        return all_keywords_matchRegex
    }


    async getCountLinksByKeywords(database, query) {
        let all_keywords_matchRegex = this._getKeywordsMatchRegex_fromQuery(query)
        let back = await database.Mongo.db(database._usedDataBaseName).collection("links").countDocuments({
            $or: [
                { title: all_keywords_matchRegex },
                { description: all_keywords_matchRegex },
                { keywords: all_keywords_matchRegex },
            ]
        })
        console.log("back",back)
        return back
    }

    /**
     * f(): Retourne une liste de 0 à 20 élements des liens trouvés matchant la query
     * @param {String} query - La string de recherche à effectuer et transformer en mot clés
     * @param {Object} infos - { from: 0, to: 20 } le range des données à récupérer. (eq <=> quelle page * longeur par page)
     * @returns "{ count: total document hit by query, fetched: max 20 documents }"
     */
    async getAllLinksByQuery(database, query, infos) {
        let all_keywords_matchRegex = this._getKeywordsMatchRegex_fromQuery(query)

        infos = {
            from: (infos.from != undefined ? parseInt(infos.from) : 0),
            to: (infos.to != undefined ? parseInt(infos.to) : 20),
        }

        let the_skip = parseInt((infos.from ?? 0))
        let the_limit = parseInt((infos.from != undefined ? `${( (infos.to != undefined && infos.to < 20 && infos.to > 0) ? infos.to : 20)}` : `${( (infos.to != undefined && (infos.to-infos.from) < 20 && (infos.to-infos.from) > 0) ? (infos.from+infos.to) : 20)}`))

        console.log("the_skip",the_skip,"the_limit",the_limit)

        return await database.Mongo.db(database._usedDataBaseName).collection("links").aggregate([
            {
                $match: {
                    $or: [
                        { title: all_keywords_matchRegex } , 
                        { description: all_keywords_matchRegex } , 
                        { keywords: all_keywords_matchRegex } , 
                    ]
                }
            },
            {
                $addFields: {
                    "isMatchTitle": {
                        $regexMatch: {
                            input: "$title",
                            regex: all_keywords_matchRegex,
                        }
                    },
                    "isMatchUrl": {
                        $regexMatch: {
                            input: "$url",
                            regex: all_keywords_matchRegex
                        }
                    },"isMatchDescription": {
                        $regexMatch: {
                            input: "$description",
                            regex: all_keywords_matchRegex
                        }
                    },"isMatchKeywords": {
                        $regexMatch: {
                            input: {
                                $reduce:{
                                    "input":"$keywords",
                                    "initialValue":"",
                                    "in": {
                                        $concat:["$$value","-","$$this"]
                                    }
                                }
                            },
                            regex: all_keywords_matchRegex
                        }
                    },
                }
            },
            // {
            //     $match: {
            //         $or: [
            //             { isMatchTitle: { $eq: true } }, 
            //             { isMatchUrl: { $eq: true } }, 
            //             { isMatchDescription: { $eq: true } }, 
            //             { isMatchKeywords: { $eq: true } }, 
            //         ]
            //     }
            // },
            {
                $project: {
                    url: 1,
                    description: { $substrCP: ["$description", 0, 300] },   
                    title: 1,
                }
            },
            {
                $sort: {
                    isMatchTitle : -1,
                    isMatchUrl : -1,
                    isMatchDescription : -1,
                    isMatchKeywords : -1,
                    //"url": 1,
                    //"title": 1,
                    //"description": 1,
                    //"keywords": 1,
                }
            },
            {
                $skip: the_skip
            },
            {
                $limit: the_limit
            },
        ]).toArray()
    }


}

module.exports = new Dibsilon()