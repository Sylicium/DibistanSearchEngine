
//const logger = new (require("./logger"))()
//const somef = require("./someFunctions")

const dibsilon = require('../localModules/dibsilon');
const somef = require('../localModules/someFunctions');
let DIBSILON = require("../localModules/dibsilon")

const MongoClient = require('mongodb').MongoClient;


// v1.0.0 - 24/04/2022


/*function getdb() {
    db = MongoClient.connect(url, function(err, Mongo) {
        if(err) throw err
        TheMongoInstance = Mongo
        logger.debug("set mongo instance.")
    })
    return new Database(TheMongoInstance);
    
}*/


logger = {
    info: (...args) => { console.log(...args) },
    debug: (...args) => { console.log("DEBUG ",...args) },
}


let Temp_ = {
    guildDatas: {
        editing: {
            // "guild_id": false
        }
    }
}


class Database {
    constructor() {
        this.Mongo = undefined
        this._usedDataBaseName = undefined
        this._botInstance = undefined
    }

    __get__() { return this }

    _setMongoClient(the_mongo) {
        this.Mongo = the_mongo
        logger.debug("MongoClient singleton set.")
    }

    _useDb(DbName) {
        return this._usedDataBaseName = DbName
    }

    _setBotInstance_(bot) {
        this._botInstance = bot
    }

    async getGlobalSettings() {
        let object = await this.Mongo.db(this._usedDataBaseName).collection("global_data").findOne({"data_type":"global_data"})
        if(!object) {
            //logger.debug("!object")
            let d = patterns.globalData()
            await this.Mongo.db(this._usedDataBaseName).collection("global_data").insertOne(d)
            object = await this.Mongo.db(this._usedDataBaseName).collection("global_data").findOne({"data_type":"global_data"})
        }

        return new GlobalSettingsClass(
            {
                databaseName: this._usedDataBaseName,
                collectionName: "global_data",
                _id: object._id
            },
            object
        )
    }


    async getAccountByID(identifiant) {
        return this.Mongo.db(this._usedDataBaseName).collection("accounts").findOne({id:identifiant})
    }
    async findAccount(search_params) {
        return this.Mongo.db(this._usedDataBaseName).collection("accounts").findOne(search_params)
    }
    async findAccounts(search_params) {
        return this.Mongo.db(this._usedDataBaseName).collection("accounts").find(search_params).toArray()
    }
    /**
     * f(): Renvoie un object permettant de manipuler les données de la BDD pour la guilde renseignée
     * @param {String} guild_id - L'id de la guilde à récupérer
     * @returns class_guildDatas
     */
    async getGuildDatas(guild_id) {
        try {
            let _temp_code_ = somef.genHex(8)
            while(Temp_.guildDatas.editing[guild_id]) { await somef.sleep(1)} // Evite de créer plusieur fois l'objet dans la base de donnée si il n'existait pas et que cette fonction est appellée plusieur fois très rapidement
            Temp_.guildDatas.editing[guild_id] = true
            logger.debug(`[${_temp_code_}] Temp_.guildDatas.editing[${guild_id}] set to true`)
            let object = await this.Mongo.db(this._usedDataBaseName).collection("serverDatas").findOne({"guild.id": guild_id})
            //logger.debug("ok getGuildDatas")
            if(!object) {
                logger.debug("!object", (new Error()))
                let g = patterns.serverData(this._botInstance.guilds.cache.get(guild_id))
                await this.Mongo.db(this._usedDataBaseName).collection("serverDatas").insertOne(g)
                object = await this.Mongo.db(this._usedDataBaseName).collection("serverDatas").findOne({"guild.id": guild_id})
            }
            Temp_.guildDatas.editing[guild_id] = false
            logger.debug(`[${_temp_code_}] Temp_.guildDatas.editing[${guild_id}] set to false`)
            return new ServerClass(
                {
                    databaseName: this._usedDataBaseName,
                    collectionName: "serverDatas",
                    _id: object._id
                },
                object
            )
        } catch(e) {
            Temp_.guildDatas.editing[guild_id] = false
            logger.debug(`[${_temp_code_}] Temp_.guildDatas.editing[${guild_id}] set to false (after catch)`)
        }
    }

    /*
    async _setValueOfMongoDocument(MongoDocumentID, collectionName, field, value, forceUpsert=true) {
        await Database_.Mongo.db(this._usedDataBaseName).collection(collectionName).updateOne(
            { _id: MongoDocumentID },
            {
              $set: {
                [`${field}`]: value
              }
            },
            { upsert: forceUpsert }
        )
        await this._updateObject()
        return;
    }
    */

    async getAllLinks() {
        return this.Mongo.db(this._usedDataBaseName).collection("links").find({ }).toArray()
    }
    async getAllLinks_notChecked(limitLength=10000) {
        //let l = await this.Mongo.db(this._usedDataBaseName).collection("unfetchedLinks").find({ "url": { $regex: "dirty", $options: "g" } }).sort({
        let l = await this.Mongo.db(this._usedDataBaseName).collection("unfetchedLinks").find().sort({
            "createdAt": 1
        }).limit(limitLength).toArray()
        /*l = l.filter(x => {
            return (x.url.includes("dirtybiol") || x.url.includes("dibistan") || x.url.includes("dibi") )
        })*/
        return l
    }

    /**
     * f(): Retourne une liste de 0 à 20 élements des liens trouvés matchant la query
     * @param {String} query - La string de recherche à effectuer et transformer en mot clés
     * @param {Object} infos - { from: 0, to: 20 } le range des données à récupérer. (eq <=> quelle page * longeur par page)
     * @returns "{ count: total document hit by, fetched: max 20 documents }"
     */
    async getAllLinksByQuery(query, infos) {
        /*
        infos = {
            start: (req.query.start ?? 0), // skip first X links.
        }
        */
         
        let mongo_fetched = (await DIBSILON.getAllLinksByQuery(this, query, infos))

        console.log("mongo_fetched:",mongo_fetched)
        return {
            count: await DIBSILON.getCountLinksByKeywords(this, query),
            fetched: mongo_fetched
        }
    }

    async getAllLinksByKeywords_2(keywordList) {
        let keywordList_regex = keywordList.map(x => { return new RegExp(x) })
        let listOfFindTests = []
        console.log("keywordList_regex length:",keywordList_regex.length)
        for(let i in keywordList_regex) {
            listOfFindTests.push(...[
                { "description": { 
                    '$regex': keywordList_regex[i], '$options': 'i' 
                    }
                },
                { "title": { 
                        '$regex': keywordList_regex[i], '$options': 'i' 
                    }
                },
                { "url": { 
                    '$regex': keywordList_regex[i], '$options': 'i' 
                    }
                },
                { "keywords": keywordList_regex[i] },
            ])
        }
        console.log("listOfFindTests",listOfFindTests)
        console.log("[LOG-111] START FETCH", new Date())
        //let mongo_fetched = await this.Mongo.db(this._usedDataBaseName).collection("links").aggregate([
        //    { $match: { title: /e/i } },
        //    {
        //        $sort: { title: -1 }
        //    },
        //    {
        //        $limit: 1000
        //    },
        //])


        //.mapReduce(
        //    function () {
        //        emit((this.site + '/').match(/(?:https?:\/\/)?(?:www\.)?([\w.]+)(?=\/)/)[1], 1)
        //    },
        //    function (key, values) {
        //        return values.length
        //    }, { out: 'websiteLinksCount' }
        //)


        // console.log("[LOG-111] END FETCH", new Date())

        // console.log("mongo_fetched:",mongo_fetched)
        // console.log("[LOG-113] START ARRAY", new Date())
        // let mongo_fetched_array = await mongo_fetched.toArray()
        // console.log("[LOG-113] END ARRAY", new Date())

        // return mongo_fetched_array


        return (await this.Mongo.db(this._usedDataBaseName).collection("links").find({
            
            $or: [...listOfFindTests]
        }).toArray())
        
        
        /*.sort((a,b) => {
            let A_any_in_title = somef.any(somef.getKeywords(a.title), keywordList_regex)
            let A_any_in_url = somef.any(somef.getKeywords(a.url), keywordList_regex)
            let A_any_in_description = somef.any(somef.getKeywords(a.description), keywordList_regex)

            let B_any_in_title = somef.any(somef.getKeywords(b.title), keywordList_regex)
            let B_any_in_url = somef.any(somef.getKeywords(b.url), keywordList_regex)
            let B_any_in_description = somef.any(somef.getKeywords(a.description), keywordList_regex)

            if(A_any_in_title && !B_any_in_title) {
                return -1
            } else if(B_any_in_title && !A_any_in_title) {
                return 1
            } else {
                if( (A_any_in_title && A_any_in_url) && (!B_any_in_url) ) {
                    return -1
                } else if( (B_any_in_title && B_any_in_url) && (!A_any_in_url) ) {
                    return 1
                } else {
                    if(A_any_in_description && !B_any_in_description) {
                        return -1
                    } else if(B_any_in_description && !A_any_in_description) {
                        return 1
                    } else {
                        return 0
                    }
                }
            }
        })*/
    }

    /**
     * f(): Supprime tous les URLs renseignés de la collection des liens unfetched
     * @param {Array} UrlList - Liste des url à supprimer
     * @returns 
     */
     async unfetchedLinksBecomeFetchedDeleteOne(url) {        
        return this.Mongo.db(this._usedDataBaseName).collection("unfetchedLinks").deleteOne({
            "url": url
        })
    }
    /**
     * f(): Supprime tous les URLs renseignés de la collection des liens unfetched
     * @param {Array} UrlList - Liste des url à supprimer
     * @returns 
     */
     async unfetchedLinksBecomeFetchedDeleteList(UrlList) {
        console.log("[...UrlList]:",[...UrlList])
        let listOfFindTests = UrlList.map(x => {
            return { "url": x }
        })
        return this.Mongo.db(this._usedDataBaseName).collection("unfetchedLinks").deleteMany({
            $or: [...listOfFindTests]
        })
    }

    async markLinkAsFetched(datas) {
        //let keywords = somef.removeDuplicate(datas.keywords.map(x => { return x.trim() }))
        let keywords =datas.keywords.map(x => { return x.trim() }) // ne pas retirer les doublons pour pouvoir compter le nombre de match sur la page
        let page = {
            url: datas.url.trim(),
            title: datas.title.trim(), // document.title
            description: datas.description.trim(), // first <p> ou suite de texte
            keywords: keywords,
            lastFetch: Date.now(),
            appearenceCount: 1,
            createdAt: Date.now(),
        }
        if(datas.title == "" || datas.description == "") return false
        await this.Mongo.db(this._usedDataBaseName).collection("links").updateOne(
            { "url": datas.url },
            {
                $set: {
                    [`url`]: datas.url.trim(),
                    [`title`]: datas.title.trim(), // document.title
                    [`description`]: datas.description.trim(), // first <p> ou suite de texte
                    [`keywords`]: keywords,
                    [`lastFetch`]: Date.now(),
                    [`appearenceCount`]: 1,
                    [`createdAt`]: Date.now(),
                }
            }
            ,
            { upsert: true }
        )

        /*await Database_.Mongo.db(this._usedDataBaseName).collection("links").updateOne(
            { url: url },
            {
              $set: {
                [`lastFetch`]: Date.now()
              }
            },
            { upsert: false }
        )
        return;*/
    }

    async insertNewPage(datas) {
        throw new Error("deprecated")
        let page = {
            url: datas.url,
            title: datas.title, // document.title
            description: datas.description, // first <p> ou suite de texte
            keywords: datas.keywords,
            lastFetch: 0,
            appearenceCount: 1,
            createdAt: Date.now(),
        }
        await this.Mongo.db(this._usedDataBaseName).collection("links").insertOne(page)
        // object = await this.Mongo.db(this._usedDataBaseName).collection("links").findOne({"data_type":"global_data"})
    }

    async insertManyLinks(list) {
        //console.log("insertManyLinks> list:",list)
        let the_list = list.map(x => {
            return {
                url: x.url,
                //title: x.title, // document.title
                //description: x.description, // first <p> ou suite de texte
                //keywords: x.keywords,
                //lastFetch: 0,
                //appearenceCount: 1,
                createdAt: Date.now(),
            }
        })
        await this.Mongo.db(this._usedDataBaseName).collection("unfetchedLinks").insertMany(the_list)
    }





//Then I need to get the Meta description,


}


let Database_ = new Database()

module.exports = Database_


//logger.debug("Instance_.findAccount: "+Instance_.findAccount("774003919625519134"))

/*
let Instance_
//module.exports = Instance_

module.exports = async () => {
    let connected_client = await MongoClient.connect(url)
    Instance_ = new Database(connected_client)
    logger.debug("Instance_.findAccount: "+JSON.stringify(await Instance_.findAccount({id:"774003919625519134"})))
}
*/


/*

let url = "mongodb+srv://discordbot:P3xT66OEFmNemdgG@cluster0.wrmyx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
MongoClient.connect(url, function(err, Mongo) {
    if(err) throw err
    this.Mongo = Mongo
    module.exports = Mongo
})

*/

/*

const MongoClient = require('mongodb').MongoClient;
 
let url = "mongodb+srv://discordbot:P3xT66OEFmNemdgG@cluster0.wrmyx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
let Db;


MongoClient.connect(url, function(err, Mongo) {
    if(err) throw err
    console.log("Connected successfully to server");
    Db = Mongo.db("DBGCanary");

    console.log(Db.collection("accounts").find({id:"774003919625519134"}))

});


*/
