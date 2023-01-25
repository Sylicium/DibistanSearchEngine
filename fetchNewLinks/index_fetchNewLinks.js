
/*

Ligne 240
enfait faut push dans la BDD le lien qu'on fetch avec le titre, le lastFetch et tout
et les liens fetch sur cette page là, on a aucune info, ducoup juste add une ligne avec l'url et lastFetch=0 mais c'est tout
ensuite on get tous ces liens qui n'ont pas de titre et on les fetch.
Et quand on les a fetch, on UPDATE le document qui leur est relatif en remplissant ducoup par les infos manquantes (title, description, etc..)
Donc creer / update le document ? comment savoir en restant optimisé ?





*/

try {
    require("dotenv").config()
} catch(e) { console.log(e) }


const Database = require("./databaseParser.js")
const MongoClient = require('mongodb').MongoClient;
const logger = {
    info: (...args) => { console.log(...args) },
}

const DOMParser = require("dom-parser")


const axios = require("axios");
const source = axios.CancelToken.source();
const cancelToken = source.token;
/*
const req = axios.get('http://localhost:3000', {
    cancelToken
});

// https://dirtybiologistan.fandom.com/fr/wiki/Organisation_des_R%C3%A9gions_Unies

await new Promise(resolve => setTimeout(resolve, 500));

source.cancel('test cancellation');

// Got error, but still prints "Got request!"
const err = await req.catch(err => err);
axios.isCancel(err); // true
*/

logger.info("=======================================")
logger.info("========== [Starting script] ==========")
logger.info("=======================================")

let url = process.env.MONGODB_URL
console.log(process.env)
logger.info("Tentative de connection à MongoDB...")
MongoClient.connect(url, function(err, Mongo) {
    if(err) throw err
    Database._setMongoClient(Mongo)
    Database._useDb("dibim")
    logger.info("  Mongo instance connected.")
    _allCode()
})



function _allCode() {

console.log("_allCode running")

var matchURL = /(?:ht|f)tps?:\/\/[-a-zA-Z0-9.]+\.[a-zA-Z]{2,3}(\/[^"<]*)?/g;
let matchURL2 = /(http|https|ftp|ftps)\:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}(\/\S*)?/g;


let baseURL = "https://dirtybiologistan.fandom.com/fr/wiki/Sp%C3%A9cial:Recherche?query=&scope=internal&contentType=&ns%5B0%5D=0&ns%5B1%5D=2900"

let main_list = [baseURL]
let new_to_check = [baseURL]

new_to_check_list = [
    'https://dirtybiologistan.fandom.com/fr/wiki/Sp%C3%A9cial:Recherche?query=&scope=internal&contentType=&ns%5B0%5D=0&ns%5B1%5D=2900',
    'https://beacon.wikia-services.com/__track/view?a=0\\u0026n=-1\\u0026env=prod\\u0026c=2829865\\u0026lc=fr\\u0026lid=88\\u0026x=frdirtybiologistan\\u0026s=ucp_desktop\\u0026mobile_theme=fandom-dark\\u0026rollout_tracking=mw137',
    'https://beacon.wikia-services.com/__track/special/performance_metrics?w=2829865\\u0026lc=fr\\u0026d=frdirtybiologistan\\u0026s=ucp_desktop\\u0026u=0\\u0026i=sjc-prod\\u0026a=https%3A%2F%2Fdirtybiologistan.fandom.com%2Ffr%2Fwiki%2FSp%25C3%25A9cial%3ARecherche',
    'http://www.w3.org/2000/svg',
    'http://www.w3.org/1999/xlink',
    'https://www.fastly-insights.com/static/scout.js?k=17272cd8-82ee-4eb5-b5a3-b3cd5403f7c5',
    'https://www.googletagmanager.com/ns.html?id=GTM-N6XD44P',
    'https://services.fandom.com/icbm/api/loader?app=fandomdesktop',
    'https://dirtybiologistan.fandom.com/fr/api.php?action=rsd',
    'https://bit.ly/FanLabWikiBar',
    'https://www.cortexrpg.com/',
    'https://bit.ly/TikTokFandom',
    'https://www.muthead.com/',
    'https://www.fandomatic.com',
    'https://www.fandom.com/do-not-sell-my-info',
    'https://www.fandom.com/fr/licensing-fr',
    'https://www.fandom.com/fr/terms-of-use-fr',
    'https://www.futhead.com/',
    'https://www.fandom.com/about?uselang=fr',
    'https://www.fanatical.com/',
    'https://twitter.com/fandom_fr',
    'https://www.fandom.com/press?uselang=fr',
    'https://www.fandom.com/fr/privacy-policy-fr',
    'https://www.fandom.com/careers',
    'https://about.fandom.com/mediakit',
    'https://dirtybiologistan.fandom.com/fr/wiki/Cat%C3%A9gorie:%C3%89bauche',
    'https://dirtybiologistan.fandom.com/fr/wiki/Union_F%C3%A9d%C3%A9rale_des_Etats_Xali_Ind%C3%A9pendant',
    'https://dirtybiologistan.fandom.com/fr/wiki/R%C3%A9publique_du_Poteau_Rose/Chronologie',
    'https://dirtybiologistan.fandom.com/fr/wiki/Sp%C3%A9cial:AllMaps',
    'https://dirtybiologistan.fandom.com/fr/wiki/Cat%C3%A9gorie:%C3%89tats',
    'https://dirtybiologistan.fandom.com/fr/wiki/Bestiaire_et_Flore_Vulcane',
    'https://dirtybiologistan.fandom.com/fr/wiki/Lac_de_Sang_de_G%C3%A9ants',
    'https://dirtybiologistan.fandom.com/fr/wiki/Wiki_Dirtybiologistan',
    'https://dirtybiologistan.fandom.com/fr/wiki/Cat%C3%A9gorie:Agences',
    'https://dirtybiologistan.fandom.com/fr/wiki/Cat%C3%A9gorie:Wiki_Dirtybiologistan',
    'https://dirtybiologistan.fandom.com/fr/wiki/Cat%C3%A9gorie:Territoires',
    'https://dirtybiologistan.fandom.com/fr/wiki/Cat%C3%A9gorie:Journaux',
    'https://dirtybiologistan.fandom.com/fr/wiki/Cat%C3%A9gorie:Alliances',
    'https://dirtybiologistan.fandom.com/fr/wiki/Cat%C3%A9gorie:R%C3%A9gions',
    'https://dirtybiologistan.fandom.com/fr/wiki/R%C3%A9publique_Populaire_du_Dirtybiologistan',
    'https://dirtybiologistan.fandom.com/fr/wiki/Organisation_des_R%C3%A9gions_Unies',
    'https://dirtybiologistan.fandom.com/fr/wiki/Dibi',
    'https://dirtybiologistan.fandom.com/fr/wiki/Liste_des_serveurs_Discord',
    'https://dirtybiologistan.fandom.com/fr/wiki/Sp%C3%A9cial:Recherche',
    'https://dirtybiologistan.fandom.com/fr/wiki/Dirtybiologistan',
    'https://dirtybiologistan.fandom.com/fr/wiki/Sp%C3%A9cial:Community',
    'https://dirtybiologistan.fandom.com/fr/wiki/Sp%C3%A9cial:AllPages',
    'https://dirtybiologistan.fandom.com/fr/wiki/Cat%C3%A9gorie:Entreprises',
    'https://dirtybiologistan.fandom.com/fr/wiki/Cat%C3%A9gorie:D%C3%A9partements',
    'https://dirtybiologistan.fandom.com/fr/wiki/Comment_contribuer',
    'https://dirtybiologistan.fandom.com/fr/wiki/Cat%C3%A9gorie:Lieux',
    'https://dirtybiologistan.fandom.com/fr/wiki/Cat%C3%A9gorie:Organisations_politiques',
    'https://dirtybiologistan.fandom.com/fr/wiki/Cat%C3%A9gorie:Villes',
    'http://communaute.fandom.com/wiki/Centre_des_communaut%C3%A9s',
    'https://dirtybiologistan.fandom.com/fr/wiki/Sp%C3%A9cial:Recherche?scope=internal&amp;query=&amp;contentType=posts',
    'https://dirtybiologistan.fandom.com/fr/wiki/En:Volcan',
    'https://dirtybiologistan.fandom.com/fr/wiki/Poulpito_GDL',
    'https://dirtybiologistan.fandom.com/fr/wiki/Volcan',
    'https://dirtybiologistan.fandom.com/fr/wiki/Docks_Abandonn%C3%A9s',
    'https://dirtybiologistan.fandom.com/fr/wiki/Hautes_Dunes',
    'https://dirtybiologistan.fandom.com/fr/wiki/Sp%C3%A9cial:Recherche?scope=internal&amp;query=&amp;ns%5B0%5D=0&amp;ns%5B1%5D=1&amp;ns%5B2%5D=2&amp;ns%5B3%5D=3&amp;ns%5B4%5D=4&amp;ns%5B5%5D=5&amp;ns%5B6%5D=6&amp;ns%5B7%5D=7&amp;ns%5B8%5D=8&amp;ns%5B9%5D=9&amp;ns%5B10%5D=10&amp;ns%5B11%5D=11&amp;ns%5B12%5D=12&amp;ns%5B13%5D=13&amp;ns%5B14%5D=14&amp;ns%5B15%5D=15&amp;ns%5B16%5D=110&amp;ns%5B17%5D=111&amp;ns%5B18%5D=420&amp;ns%5B19%5D=421&amp;ns%5B20%5D=500&amp;ns%5B21%5D=501&amp;ns%5B22%5D=502&amp;ns%5B23%5D=503&amp;ns%5B24%5D=828&amp;ns%5B25%5D=829&amp;ns%5B26%5D=1200&amp;ns%5B27%5D=1201&amp;ns%5B28%5D=1202&amp;ns%5B29%5D=2000&amp;ns%5B30%5D=2001&amp;ns%5B31%5D=2002&amp;ns%5B32%5D=2900&amp;ns%5B33%5D=2901',
    'https://dirtybiologistan.fandom.com/fr/wiki/Sp%C3%A9cial:Recherche?scope=internal&amp;query=&amp;ns%5B0%5D=500&amp;ns%5B1%5D=502',
    'https://dirtybiologistan.fandom.com/fr/wiki/Sp%C3%A9cial:Recherche?scope=internal&amp;query=&amp;ns%5B0%5D=6',
    'https://dirtybiologistan.fandom.com/fr/wiki/Sp%C3%A9cial:Recherche?scope=internal&amp;query=&amp;ns%5B0%5D=2',
    'https://dirtybiologistan.fandom.com/fr/wiki/Lavoniquien',
    'https://dirtybiologistan.fandom.com/fr/wiki/En:Grande_Clairi%C3%A8re',
    'https://dirtybiologistan.fandom.com/fr/wiki/Plateaux_de_la_R%C3%A9solution',
    'https://dirtybiologistan.fandom.com/fr/wiki/Varech_noir-bleu',
    'https://docs.google.com/document/d/1eU2lux4ESlANe5wcFrUNz8HHTo0kXB6hjZgwhOZ3slc/edit?usp=sharing',
    'https://dirtybiologistan.fandom.com/fr/wiki/Contr%C3%A9es_Magmatiques/R%C3%A9glement',
    'https://dirtybiologistan.fandom.com/fr/wiki/For%C3%AAt_Abyssale/Lore',
    'https://dirtybiologistan.fandom.com/fr/wiki/Grand_Sud',
    'https://dirtybiologistan.fandom.com/fr/wiki/La_L%C3%A9gende_des_Golems',
    'https://dirtybiologistan.fandom.com/fr/wiki/Lac_%C3%89carlate',
    'https://dirtybiologistan.fandom.com/fr/wiki/Terre_des_Mirages',
    'https://dirtybiologistan.fandom.com/fr/wiki/Bar_%C3%A0_L%C3%A9o',
    'https://dirtybiologistan.fandom.com/fr/wiki/R%C3%A9publique_Populaire_D%C3%A9mocratique_de_Groc%C3%A9e',
    'https://dirtybiologistan.fandom.com/fr/wiki/Le_Voyage',
    'https://dirtybiologistan.fandom.com/fr/wiki/R%C3%A9publique_du_Poteau_Rose',
    'https://www.fandom.com/what-is-fandom',
    'https://www.facebook.com/fandom.fr',
    'https://dirtybiologistan.fandom.com/fr/wiki/Sp%C3%A9cial:Recherche?scope=internal&amp;query=&amp;lang=fr&amp;limit=25&amp;ns%5B0%5D=0&amp;ns%5B1%5D=2900&amp;page=2',
    'https://dirtybiologistan.fandom.com/fr/wiki/Sp%C3%A9cial:Recherche?scope=internal&amp;query=&amp;lang=fr&amp;limit=25&amp;ns%5B0%5D=0&amp;ns%5B1%5D=2900&amp;page=5',
    'https://dirtybiologistan.fandom.com/fr/wiki/Sp%C3%A9cial:Recherche?scope=internal&amp;query=&amp;lang=fr&amp;limit=25&amp;ns%5B0%5D=0&amp;ns%5B1%5D=2900&amp;page=3',
    'https://dirtybiologistan.fandom.com/fr/wiki/Sp%C3%A9cial:Recherche?scope=internal&amp;query=&amp;lang=fr&amp;limit=25&amp;ns%5B0%5D=0&amp;ns%5B1%5D=2900&amp;page=4',
    'http://communaute.fandom.com/wiki/Aide:Contenu',
    'https://play.google.com/store/apps/details?id=com.fandom.app&hl=fr&referrer=utm_source%3Dwikia%26utm_medium%3Dglobalfooter',
    'https://onepiece.fandom.com/fr/',
    'http://archipelago.phrasewise.com/rsd',
    'https://beacon.wikia-services.com/__track/view?a=2019\\u0026n=0\\u0026env=prod\\u0026c=2829865\\u0026lc=fr\\u0026lid=88\\u0026x=frdirtybiologistan\\u0026s=ucp_desktop\\u0026mobile_theme=fandom-dark\\u0026rollout_tracking=mw137',
    'https://beacon.wikia-services.com/__track/view?a=1743\\u0026n=0\\u0026env=prod\\u0026c=2829865\\u0026lc=fr\\u0026lid=88\\u0026x=frdirtybiologistan\\u0026s=ucp_desktop\\u0026mobile_theme=fandom-dark\\u0026rollout_tracking=mw137',
    'https://discord.com/invite/bGge3JmK8x',
    'http://www.grandsudradio.fr/'
  ]

let V2 = {
    fetchAllLinks: (url) => {

    }
}






let server = require("./server")
server.run()

let functionlist = {
    oneMoreLoop: oneMoreLoop,
    writeDown: () => {
        let d = (new Date())
        let fileName = `REPORT_` + d.toLocaleDateString().split("/").join("-") + "_" + d.toLocaleTimeString().replace(":","h").replace(":","m")+ `s_${main_list.length}_links.txt`
        let the_content = [
            `File created on ${d.toString()} (${d.toLocaleString()})`,
            `Containing ${main_list.length} unique website links`,
            ``,
            `${main_list.join("\n")}`
        ].join("\n")

        fs.appendFileSync(`C:\\Users\\Sylicium\\Documents\\DirtyBiologystan\\Projets\\searchEngine\\DibistanSearchEngine\\fetchNewLinks\\writtenDown\\${fileName}`, the_content)
    },
}

server.setFunctions(functionlist)


let newFetchedToPushToDatabase = []
let successfullyFetchedLinks_toDelete = []

async function oneMoreLoop(chunkLength) {
    /*
    total_links
    total_fetching_links
    total_fetched_links
    chunks_processing
    chunks_total
    linksInChunks_processed
    linksInChunks_total
    */
    //server.emitChanges("total_links", 1)


    //server.emitChanges("startLoop", Date.now())

    //server.emitChanges("log", `Starting new loop from main_list=${main_list.length} AND new_to_check=${new_to_check.length} and chunks size=${chunkLength}`)

    //server.emitChanges("total_fetching_links", new_to_check.length)

    newFetchedToPushToDatabase = []
    successfullyFetchedLinks_toDelete = []

    let DB_no_fetchedLinks = await Database.getAllLinks_notChecked(100)
    console.log("DB_no_fetchedLinks",DB_no_fetchedLinks)
    if(DB_no_fetchedLinks.length != 0) new_to_check = DB_no_fetchedLinks.map(x => { return x.url })
    //new_to_check = new_to_check_list

    console.log("new_to_check",new_to_check)

    let loop_start_timestamp = Date.now()
    let old_new_to_check_length = new_to_check.length
    getAllSubLinksOfLinkList_optimised_chunked(new_to_check, chunkLength).then(list => {
        //server.emitChanges("endLoop", Date.now())
        let loop_end_timestamp = Date.now()
        //server.emitChanges("log", "list:",list)
        new_to_check = removeDuplicate(list.flat(2))
        main_list = removeDuplicate(main_list.concat(list.flat(2)))
        //console.log(`One more loop made. +${new_to_check.length} links. Now having ${main_list.length} links`)
        let new_tocheck_length = new_to_check.length
        let duration = loop_end_timestamp - loop_start_timestamp/*
        total_links
        total_fetching_links
        total_fetched_links
        chunks_processing
        chunks_total
        linksInChunks_processed
        linksInChunks_total
        */
        let text_to_log = [
            ``,
            ``,
            `+====================+`,
            `Ended loop`,
            `+${new_tocheck_length} links`,
            `Now having ${main_list.length} links`,
            `Took ${formatTime(duration, "DDDDD jours, hhhmmmsss")} to process`,
            `EQ ${formatTime(duration/new_tocheck_length, "DDDDD jours, hhhmmmsss.msms")} per link`,
            `Averadge links per pages ${(new_tocheck_length/old_new_to_check_length).toFixed(3)} links/pages`,
            `+====================+`,
            ``,
            ``,
        ].join("\n")
        

        console.log("ENDED successfullyFetchedLinks_toDelete=",successfullyFetchedLinks_toDelete)
        Database.unfetchedLinksBecomeFetchedDeleteList(successfullyFetchedLinks_toDelete)

        console.log("main_list:",main_list)
        console.log(text_to_log)

        console.log(`!!! 1 newFetchedToPushToDatabase .length = ${newFetchedToPushToDatabase.length} !!!`)

        //console.log("newFetchedToPushToDatabase",newFetchedToPushToDatabase)

        newFetchedToPushToDatabase = newFetchedToPushToDatabase.filter((x, i) => { // remove duplicate urls
            /*
            x = {
                url: "url",
                fetchedIn: "fetchedFromUrl" //
            }
            */
            let found = newFetchedToPushToDatabase.find(o => { return o.url == x.url })
            return i === newFetchedToPushToDatabase.indexOf(found)
        })

        console.log("pushing to database...")
        if(newFetchedToPushToDatabase.length > 0) Database.insertManyLinks(newFetchedToPushToDatabase)
        console.log(`!!! newFetchedToPushToDatabase .length = ${newFetchedToPushToDatabase.length} !!!`)
        console.log("successfully pushed to database...")


        //server.emitChanges("log", text_to_log)

        //server.emitChanges("total_links", main_list.length)
        //server.emitChanges("total_fetching_links", 0)
        //server.emitChanges("total_fetched_links", 0)
        //server.emitChanges("chunks_processing", 0)
        //server.emitChanges("chunks_total", 0)
        //server.emitChanges("linksInChunks_processed", 0)
        //server.emitChanges("linksInChunks_total", 0)
        //server.emitChanges("total_new_links_fetched", 0)
        
    })
}

async function getAllSubLinksOfLinkList_optimised_chunked(list, chunkLength) {
    let chunks = listToChunks(list, chunkLength)
    //server.emitChanges("chunks_total", chunks.length)
    let all_list = []
    let long = chunks.length
    for(let i in chunks) {
        //server.emitChanges("chunks_processing", parseInt(i)+1)
        console.log(`[${`${parseInt(i)+1}/${long}`}] Getting chunk of ${chunks[i].length} elements.`)
        let chunk_processed = ( await getAllSubLinksOfLinkList_optimised(chunks[i]) ).flat(2)
        console.log(`[${`${parseInt(i)+1}/${long}`}] ENDED Getting chunk of ${chunks[i].length} elements. Done.`)
        chunk_processed = removeDuplicate(chunk_processed, main_list)
        all_list.push(chunk_processed)

        //server.emitChanges("total_new_links_fetched", all_list.flat(2).length)
    }
    return Promise.all(all_list)
}


async function getAllSubLinksOfLinkList_optimised(list) {
    let l = []
    let long = list.length
    let count_fetchedURLs = 0
    server.emitChanges("linksInChunks_total", long)
    for(let i in list) {
        console.log(`${`[${parseInt(i)+1}/${long}]`.padEnd(13," ")} Fetching links of ${list[i]}`)
        let all_l = getAllLinksInPage_v2(list[i], [
            "dibistan",
            "dirtybiologistan.fandom.com",
            "dirtybiology",
            "dirtybiologistan",
            "micronation",
            "crisardie",
            "drapeau",
            "constitution",
        ])
        all_l.then((newFetchedUrlList) => {
            count_fetchedURLs++
            console.log(`${`[${count_fetchedURLs}/${long}]`.padEnd(13," ")} Succesfully fetched ${newFetchedUrlList.length} links of ${list[i]}`)

            newFetchedToPushToDatabase.push(...(newFetchedUrlList.map(x => {
                return {
                    url: x,
                    fetchedIn: list[i],
                }
            })))

            server.emitChanges("add_total_new_links_fetched", newFetchedUrlList.length)
            server.emitChanges("linksInChunks_processed", count_fetchedURLs)
            server.emitChanges("add_total_fetched_links", 1)
        }).catch(e => {
            console.log(`\n\n\nERROR: ${e}\n\n\n`)
        })
        //console.log(`${`[${parseInt(i)+1}/${long}]`.padEnd(13," ").split("").map(x => { return " "}).join("")}   -> ${all_l.length} links`)
        l.push(all_l)
    }
    return Promise.all(l)
}


async function getAllLinksInPage_v2(url, mustContainWordsInPage=[]) {
    successfullyFetchedLinks_toDelete.push(url)
    if(canSpeedUpGettingPageContent(url)) {
        //server.emitChanges("debug", `canSpeedUp url: ${url}`)
        return []
    }
    try {
        //console.log("[KGZEJB] Trying to get URL",url)
        let res = await axios.get(url, { timeout: 10*1000 })
        //console.log("[KGZEJB] Done.")
        let first_match = res.data.match(matchURL)
        all_matchs = []
        for(let i in first_match) {
            let second_match = first_match[i].match(matchURL2)
            all_matchs = all_matchs.concat(second_match)
        }
        
        /******************************************/
        let htmlPage = (new DOMParser().parseFromString(res.data,"text/html"))

        //console.log("res:",res)
        //console.log("htmlPage",htmlPage)
        //console.log("htmlPage.getElementsByTagName(p)",htmlPage.getElementsByTagName("p"))
        let the_description;
        let the_description_templist = [
            ...([...htmlPage.getElementsByTagName("p")].map(x => { return x.textContent })),
            ...([...htmlPage.getElementsByTagName("h1")].map(x => { return x.textContent })),
            ...([...htmlPage.getElementsByTagName("h2")].map(x => { return x.textContent })),
            ...([...htmlPage.getElementsByTagName("h3")].map(x => { return x.textContent })),
            ...([...htmlPage.getElementsByTagName("h4")].map(x => { return x.textContent })),
            ...([...htmlPage.getElementsByTagName("h5")].map(x => { return x.textContent })),
            ...([...htmlPage.getElementsByTagName("h6")].map(x => { return x.textContent })),
        ]
        let page_title_elem = [...htmlPage.getElementsByTagName("title")]
        let page_title = (page_title_elem.length > 0 ? page_title_elem[0].textContent.trim() : "")
        the_description_templist = the_description_templist.sort((a,b) => { return b.length - a.length })
        the_description = (the_description_templist.length > 0 ? the_description_templist[0] : page_title)

        let keywords_temp = the_description_templist.join(" ")
        let keywords = keywords_temp.match(/[\p{L}]{3,}/gu)
        if(keywords == null) keywords = []
        //console.log("successfullyFetchedLinks_toDelete ++")
        //console.log("successfullyFetchedLinks_toDelete=",successfullyFetchedLinks_toDelete)
        
        if(res.data.length < 10000 || page_title == "") {
            
        } else {
            Database.markLinkAsFetched({
                url: url,
                title: page_title, // document.title
                description: the_description, // first <p> ou suite de texte
                keywords: keywords,
            })
        }


        /******************************************/

        if(mustContainWordsInPage.length == 0) {
            return all_matchs
        } else {
            if(
                textIncludeAny(res.data, mustContainWordsInPage)
            || textIncludeAny(url, mustContainWordsInPage)
            ) {
                /* A REMOVE */
                // all_matchs = all_matchs.filter(x => { return x.includes("dirtybiolog") && x.includes("fandom")})
                /*******************/

                return all_matchs
            } else { return [] }
        }
    } catch(e) {
        console.log(`Error catched: ${e}`)
        return []
    }
}



function canSpeedUpGettingPageContent(url) {
    if(url == undefined) return true
    if(url.includes("https://discord.gift/")) {
        //fs.appendFileSync("C:\\Users\\Sylicium\\Documents\\DirtyBiologystan\\Projets\\searchEngine\\DibistanSearchEngine\\NITRO_SCRAPPED.txt", `\n${url}`)
        return true
    }
    let speedUpLinks = {
        "includes": [
        ],
        "endsWith": [
            ".png", ".jpg", ".jpeg", ".mp4", ".mp3", ".mov", ".wav", ".webp", ".svg", ".json", ".ttl", ".woff", ".rdf"
        ],
        "startsWith": [
            "https://www.youtube.com/redirect?",
            "https://discord.gg/",
            "https://static.wikia.nocookie.net/",
            "https://www.redditstatic.com/",
            "https://yt3.ggpht.com/",
            "https://rr10---sn-4gxx-hgns",
            "https://ton.local.twitter.com",
            "https://youtube.com",
            "https://www.youtube.com",
            "https://onepiece.fandom.com/de/wiki/",
        ]
    }

    function checkTextAny_callback(test, list, callback) {
        for(let i in list) {
            if(callback(test, list[i])) return true
        }
        return false
    }

    if(textIncludeAny(url, speedUpLinks.includes)) return true
    if(checkTextAny_callback(url, speedUpLinks.startsWith, (text, testingElem) => {
        if(text.substr(0,75).includes(testingElem)) return true
    })) return true
    if(checkTextAny_callback(url, speedUpLinks.endsWith, (text, testingElem) => {
        if(text.substr(text.length-50,55).includes(testingElem)) return true
    })) return true
    

    let unitTests = [
        (url) => {
            if(!url.includes(".wikipedia.org/")) return false
            let whitelist = [
                "fr", "en", "es", "be", "eu", "uk"
            ]
            let test = url.split("https://")[1]
            if(test == undefined) return false
            test = test.split(".wikipedia.org/")[0]
            if(whitelist.includes(test)) return true
            return false
        },
    ]
    for(let i in unitTests) {
        if(unitTests[i](url)) return true
    }
    return false
}


























function formatTime(millisecondes, format) {
    /*
    Renvoie un dictionnaire avec le formatage de la durée en ms, en jour, heures, etc...
    YYYY: year
    MM: month
    DDDDD: jour de l'année
    DD: jours du mois
    hh: heure
    mm: minute
    ss: seconde
    ms: millisecondes
    */
    let v = {
        y: 31536000000,
        mo: 2628000000,
        d: 86400000,
        h: 3600000,
        m: 60000,
        s: 1000
    }
    let la_date = {
        years: Math.floor(millisecondes / v.y),
        months: Math.floor((millisecondes % v.y) / v.mo), // value de l'année divisée en douze poue faire à peu pres
        all_days: Math.floor(millisecondes / v.d), // jours de l'année
        days: Math.floor(((millisecondes % v.y) % v.mo) / v.d), // jours du mois
        hours: Math.floor((((millisecondes % v.y) % v.mo) % v.d) / v.h),
        minutes: Math.floor(((((millisecondes % v.y) % v.mo) % v.d) % v.h) / v.m),
        seconds: Math.floor((((((millisecondes % v.y) % v.mo) % v.d) % v.h) % v.m) / v.s),
        milliseconds: (((((millisecondes % v.y) % v.mo) % v.d) % v.h) % v.m) % v.s
    }
    //console.log(la_date)

    function formatThis(thing, length = 2) {
        return `0000${thing}`.substr(-length)
    }

    let return_string = format.replace("YYYY", la_date.years).replace("MM", formatThis(la_date.months)).replace("DDDDD", la_date.all_days).replace("DD", formatThis(la_date.days)).replace("hh", formatThis(la_date.hours)).replace("mm", formatThis(la_date.minutes)).replace("ss", formatThis(la_date.seconds)).replace("ms", formatThis(la_date.milliseconds, 3))

    return return_string
}

/**
 * Split the `items` array into multiple, smaller arrays of the given `size`.
 *
 * @param {Array} items
 * @param {Number} size
 *
 * @returns {Array[]}
 */
function listToChunks(arr, chunkSize=1) {
    let res = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
            let chunk = arr.slice(i, i + chunkSize);
            res.push(chunk);
    }
    return res;
}

function removeDuplicate(list) { return list.filter((x, i) => i === list.indexOf(x)) }
function rmDup_and_removeAllYinX(X, Y) {
    X = removeDuplicate(X)
    for(let i in Y) {
        X.splice((X.indexOf(Y[i]) != -1 ? X.indexOf(Y[i]) : X.length), 1);
    }
    return X
}

function sleep(time) {
    return new Promise(resolve => setTimeout(resolve, time));
} 

// axios.get("https://dirtybiologistan.fandom.com/fr/wiki/Wiki_Dirtybiologistan", { timeout: 8000 }).then(res => console.log(res.data.match(regexToken)))

function concatListIfNotInList(list, listToPush) {
    let n_list = list
    //console.log("listToPush",listToPush)
    for(let i in listToPush) {
        //console.log(`listToPush[${i}]`,listToPush[i])
        if(!list.includes(listToPush[i])) n_list.push(listToPush[i])
    }
    return n_list
}

function textIncludeAny(text, list) {
    if(list.length == 0) return false
    for(let i in list) {
        let d = list[i]
        if(text.toLowerCase().includes(d.toLowerCase())) return true
    }
    return false
}
function listIncludeAny(list1, list2, lowercase=true) {
    if(list1.length == 0 || list2.length == 0) return false
    if(lowercase) {
        list1 = list1.map(x => { return (x.toLowerCase() ?? x) })
        list2 = list2.map(x => { return (x.toLowerCase() ?? x) })
    }
    for(let i in list2) {
        let item = list2[i]
        if(list1.includes(item)) return true
    }
    return false
}



}