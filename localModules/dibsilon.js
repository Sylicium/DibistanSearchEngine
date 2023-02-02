

let somef = require("./someFunctions")


class Dibsilon {
    constructor() {
        this.Algorithm = {
            copyright: "Dibsilon (c) Sylicium 2022",
            lastVersion: "0.2.0-alpha",
            date: "02/12/2022",
            developer: "Sylicium",
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

            "à": "a", "á": "a", "â": "a", "ã": "a", "ä": "a", "å": "a",
            "a": "[aàáâãäå]",

            "è": "e", "é": "e", "ê": "e", "ë": "e",
            "e": "[eèéêë]",

            "ì": "i", "í": "i", "î": "i", "ï": "i",
            "i": "[iìíîï]",

            "ò": "o", "ó": "o", "ô": "o", "õ": "o", "ö": "o", "ø": "o",
            "o": "[oòóôõöø]",
            
            "ù": "u", "ú": "u", "û": "u", "ü": "u",
            "u": "[uùúûü]",

            "ý": "y", "ÿ": "y",
            "y": "[yýÿ]",

            "ñ": "n", "n": "[nñ]",
            "ç": "c", "c": "[cç]",
            
            "æ": "ae", "ae": "(ae|æ)",
            "œ": "oe", "oe": "(oe|œ)",
        }).split(" ").join("|")})`
        let all_keywords_matchRegex = new RegExp(all_keywords_matchRegex_preTemp, "i")
        return all_keywords_matchRegex
    }


    async getCountLinksByKeywords(database, query) {
        let all_keywords_matchRegex = this._getKeywordsMatchRegex_fromQuery(query)
        let startTime = Date.now()
        console.log("[DIBSILON] getCountLinksByKeywords : start",startTime)
        let back = await database.Mongo.db(database._usedDataBaseName).collection("links").countDocuments({
            $or: [
                { title: all_keywords_matchRegex },
                { description: all_keywords_matchRegex },
                { keywords: all_keywords_matchRegex },
            ]
        })
        let endTime = Date.now()
        console.log("[DIBSILON] getCountLinksByKeywords : end",endTime,"in ",endTime-startTime)
        console.log(`[DIBSILON] getCountLinksByKeywords : back`,back)
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

        /*
        infos = {
            start: (req.query.start ?? 0), // skip first X links.
        }
        */
        
        let the_skip = (infos.start != undefined ? parseInt(infos.start) : 0)
        let the_limit = this.Config.page.length

        console.log("the_skip",the_skip,"the_limit",the_limit)

        let databaseCursor = await database.Mongo.db(database._usedDataBaseName).collection("links").aggregate([
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
                $project: {
                    url: 1,
                    description: { $substrCP: ["$description", 0, 30] },   
                    title: { $substrCP: ["$title", 0, 80] },    // ou title: 1,
                }
            },
            {
                $skip: the_skip
            },
            {
                $limit: the_limit
            },
        ])
        console.log("[DIBSILON] Got Database cursor.")
        let databaseCursor2 = databaseCursor
        let the_list = []
        /*await databaseCursor.stream().on("data", doc => {
            console.log("new doc !")
            the_list.push(doc)
        })
        while (await databaseCursor.hasNext()) {
            console.log("new doc !")
            the_list.push(await databaseCursor.next())
        }*/
        
        console.log("[DIBSILON] Got Database cursor, converting it to array...")
        //return the_list
        return databaseCursor.toArray()
    }


}

module.exports = new Dibsilon()