


let MONGODB_URL = "mongodb+srv://discordbot:B8ewi2d3PaQh6xz4@cluster0.wrmyx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"


const Database = require("./fetchNewLinks/databaseParser.js")
const MongoClient = require('mongodb').MongoClient;
const logger = {
    info: (...args) => { console.log(...args) },
}

const DOMParser = require("dom-parser")


const axios = require("axios")

logger.info("=======================================")
logger.info("========== [Starting script] ==========")
logger.info("=======================================")

let url = MONGODB_URL

logger.info("Tentative de connection à MongoDB...")
MongoClient.connect(url, function(err, Mongo) {
    if(err) throw err
    Database._setMongoClient(Mongo)
    Database._useDb("dibim")
    logger.info("  Mongo instance connected.")
    _allCode()
})


async function _allCode() {

let server = require("./server")
server.run()

//var result = await Database.getAllLinksByKeywords(["bot"])
var result = (await Database.getAllLinks_notChecked())

console.log("recherche:",result)

}
