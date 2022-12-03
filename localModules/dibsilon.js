

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

    async getAllLinksByKeywords(database, keywordList) {
        let keywordList_formatedString = somef._normalize(keywordList.join(" "))
        let all_keywords_matchRegex_preTemp = `(${somef.splitAndJoin(keywordList_formatedString, {
            "\\": "\\\\",    "|": "\\|",      "/": "\\/",
            "-": "\\-",      "_": "\\_",      "$": "\\$",
            "[": "\\[",      "]": "\\]",      "(": "\\(",
            ")": "\\)",      "{": "\\{",      "}": "\\}",
            "?": "\\?",      "*": "\\*",      "+": "\\+",
            ",": "\\,",      "^": "\\^",      ":": "\\:",
            "<": "\\<",      ">": "\\>",      "'": "\\'",
            '"': '\\"',      "#": "\\#",
        }).split(" ").join("|")})`
        let all_keywords_matchRegex = new RegExp(all_keywords_matchRegex_preTemp, "i")

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
                $limit: (10**6)
            },
        ])
    }


}

module.exports = new Dibsilon()