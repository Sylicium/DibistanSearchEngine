
//const logger = new (require("./logger"))()
//const somef = require("./someFunctions")

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

somef = {
    sleep: (time) => {
        return new Promise(resolve => setTimeout(resolve, time));
    },
    genHex: () => { return "zrgfnkergkjn" }
}

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
    async getAllLinks_notChecked() {
        return this.Mongo.db(this._usedDataBaseName).collection("unfetchedLinks").find().sort({
            "createdAt": 1
        }).toArray()
    }

    async getAllLinksByKeywords(keywordList) {
        let keywordList_regex = keywordList.map(x => { return new RegExp(x) })
        let listOfFindTests = []
        for(let i in keywordList_regex) {
            listOfFindTests.push(...[
                { "description": keywordList_regex[i] },
                { "title": keywordList_regex[i] },
                { "url": keywordList_regex[i] },
            ])
        }
        return this.Mongo.db(this._usedDataBaseName).collection("links").find({
            $or: [...listOfFindTests]
        }).limit(100).toArray()
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
        let page = {
            url: datas.url,
            title: datas.title, // document.title
            description: datas.description, // first <p> ou suite de texte
            keywords: datas.keywords,
            lastFetch: Date.now(),
            appearenceCount: 1,
            createdAt: Date.now(),
        }
        await this.Mongo.db(this._usedDataBaseName).collection("links").updateOne(
            { "url": datas.url },
            {
                $set: {
                    [`url`]: datas.url,
                    [`title`]: datas.title, // document.title
                    [`description`]: datas.description, // first <p> ou suite de texte
                    [`keywords`]: datas.keywords,
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
