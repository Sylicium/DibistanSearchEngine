
const axios = require("axios")
const fs = require("fs")

let server = require("./server")
server.run()

/*
total_links
total_fetching_links
total_fetched_links
chunks_processing
chunks_total
linksInChunks_processed
linksInChunks_total
*/

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

        fs.appendFileSync(`C:\\Users\\Sylicium\\Documents\\DirtyBiologystan\\Projets\\searchEngine\\DibistanSearchEngine\\writtenDown\\${fileName}`, the_content)
    }
}

server.setFunctions(functionlist)



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

function canSpeedUpGettingPageContent(url) {
    if(url == undefined) return true
    if(url.includes("https://discord.gift/")) {
        fs.appendFileSync("C:\\Users\\Sylicium\\Documents\\DirtyBiologystan\\Projets\\searchEngine\\DibistanSearchEngine\\NITRO_SCRAPPED.txt", `\n${url}`)
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

// https://lad.wikipedia.org/


var matchURL = /(?:ht|f)tps?:\/\/[-a-zA-Z0-9.]+\.[a-zA-Z]{2,3}(\/[^"<]*)?/g;
let matchURL2 = /(http|https|ftp|ftps)\:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}(\/\S*)?/g;

async function getAllLinksInPage(url) {
    if(canSpeedUpGettingPageContent(url)) return []
    try {
        let res = await axios.get(url, { timeout: 8000 })
        let first_match = res.data.match(matchURL)
        all_matchs = []
        //console.log("first_match:",first_match)
        for(let i in first_match) {
            let second_match = first_match[i].match(matchURL2)
            //console.log("second_match:",second_match)
            all_matchs = all_matchs.concat(second_match)
            //console.log("FOR all_matchs",all_matchs)
        }
        //console.log("all_matchs",all_matchs)
        return all_matchs
    } catch(e) {
        if(`${e}`.includes("404")) {
            console.log(`[!] Error 404 while getting URL.`)
        } else {
            console.log(`[!] Error while getting url Error: '${e}'. URL: ${url}`)
        }
        return []
    }
}

let breakCode = false


async function recursiveGetAllLinks(baseURL, maxDepth, depth=0, alreadyCheckedLinksList=[]) {
    if(breakCode) return []
    if(alreadyCheckedLinksList.includes(baseURL)) return []
    let all_links = await getAllLinksInPage(baseURL)
    if(depth == maxDepth) {
        //console.log(all_links)
        return all_links
    } else {
        let all_links_to_check = JSON.parse(JSON.stringify(all_links))
        console.log(`${`${all_links.length}`.padEnd(10," ")}${Array(depth*2+1).fill("").join(" ")}{${depth}} [-1/-1] Starting fetching all the links in ${baseURL} (${all_links_to_check.length} links)`)
        for(let i in all_links_to_check) {
            let link = all_links_to_check[i]
            if(link.length > 1000) {
                console.log(`${`${all_links}`.padEnd(10," ")}${Array(depth*2+1).fill("").join(" ")}[${parseInt(i)+1}/${all_links_to_check.length}] [Too long url] Skipped links of: ${link.substr(0,20)} (...+${link.length-20}chars)`)
                continue;
            }
            console.log(`${`${all_links.length}`.padEnd(10," ")}${Array(depth*2+1).fill("").join(" ")}{${depth}} [${parseInt(i)+1}/${all_links_to_check.length}] Fetching links of: ${link}`)
            if(alreadyCheckedLinksList.includes(link)) {
                console.log(`${`${all_links.length}`.padEnd(10," ")}${Array(depth*2+1).fill("").join(" ")}{${depth}} [${parseInt(i)+1}/${all_links_to_check.length}] Skipped: Already checked.`)
            } else {
                let new_all_links = await recursiveGetAllLinks(link, maxDepth, depth+1, alreadyCheckedLinksList)
                console.log(`${`${all_links.length}`.padEnd(10," ")}${Array(depth*2+1).fill("").join(" ")}{${depth}} [${parseInt(i)+1}/${all_links_to_check.length}] Got ${new_all_links.length} links [RAW VALUE]`)
                all_links = concatListIfNotInList(all_links, new_all_links)
                alreadyCheckedLinksList.push(link)
            }
        }
        return all_links
    }
}


async function recursiveGetAllLinks_allInOne(baseURL, maxDepth, depth=0, alreadyCheckedLinksList=[]) {
    if(breakCode) return []
    if(alreadyCheckedLinksList.includes(baseURL)) return []
    let all_links_fetched = getAllLinksInPage(baseURL)
    let all_links = [all_links_fetched]
    if(depth == maxDepth) {
        //console.log(all_links)
        return all_links_fetched
    } else {
        let all_links_to_check = JSON.parse(JSON.stringify(await all_links_fetched))
        //console.log("all_links",all_links)
        //console.log("all_links_to_check",all_links_to_check)
        console.log(`${`${all_links.length}`.padEnd(10," ")}${Array(depth*2+1).fill("").join(" ")}{${depth}} [-1/-1] Starting fetching all the links in ${baseURL} (${all_links_to_check.length} links)`)
        for(let i in all_links_to_check) {
            let link = all_links_to_check[i]
            if(link.length > 1000) {
                console.log(`${`${all_links}`.padEnd(10," ")}${Array(depth*2+1).fill("").join(" ")}[${parseInt(i)+1}/${all_links_to_check.length}] [Too long url] Skipped links of: ${link.substr(0,20)} (...+${link.length-20}chars)`)
                continue;
            }
            console.log(`${`${all_links.length}`.padEnd(10," ")}${Array(depth*2+1).fill("").join(" ")}{${depth}} [${parseInt(i)+1}/${all_links_to_check.length}] Fetching links of: ${link}`)
            if(alreadyCheckedLinksList.includes(link)) {
                console.log(`${`${all_links.length}`.padEnd(10," ")}${Array(depth*2+1).fill("").join(" ")}{${depth}} [${parseInt(i)+1}/${all_links_to_check.length}] Skipped: Already checked.`)
            } else {
                let new_all_links = recursiveGetAllLinks_allInOne(link, maxDepth, depth+1, alreadyCheckedLinksList)
                console.log(`${`${all_links.length}`.padEnd(10," ")}${Array(depth*2+1).fill("").join(" ")}{${depth}} [${parseInt(i)+1}/${all_links_to_check.length}] Got ${new_all_links.length} links [RAW VALUE]`)
                //all_links = concatListIfNotInList(all_links, new_all_links)
                new_all_links.then("Completed request")
                all_links.push(new_all_links)
                alreadyCheckedLinksList.push(link)
            }
        }
        //console.log("all_links:",all_links)
        //console.log("all_links promise all:",Promise.all(all_links))

        return Promise.all(all_links)
    }
}


async function recursiveGetAllLinks_allInOne_optimised(baseURL, maxDepth, depth=0, alreadyCheckedLinksList=[]) {
    if(breakCode) return []
    let all_links_fetched = getAllLinksInPage_optimised(baseURL)
    let all_links = [all_links_fetched]
    if(depth == maxDepth) {
        return all_links_fetched
    } else {
        let all_links_to_check = await all_links_fetched
        for(let i in all_links_to_check) {
            if(all_links_to_check[i].length > 1000) continue;
            if(!alreadyCheckedLinksList.includes(all_links_to_check[i])) {
                let new_all_links = recursiveGetAllLinks_allInOne_optimised(all_links_to_check[i], maxDepth, depth+1, alreadyCheckedLinksList)
                all_links.push(new_all_links)
                alreadyCheckedLinksList.push(all_links_to_check[i])
            }
        }

        return Promise.all(all_links)
    }
}

async function getAllLinksInPage_optimised(url) {
    if(canSpeedUpGettingPageContent(url)) return []
    try {
        let res = await axios.get(url, { timeout: 8000 })
        let first_match = res.data.match(matchURL)
        all_matchs = []
        for(let i in first_match) {
            let second_match = first_match[i].match(matchURL2)
            all_matchs = all_matchs.concat(second_match)
        }
        return all_matchs
    } catch(e) {
        return []
    }
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


var main_list = ["https://dirtybiologistan.fandom.com/fr/wiki/Wiki_Dirtybiologistan"]
var new_to_check = ["https://dirtybiologistan.fandom.com/fr/wiki/Wiki_Dirtybiologistan"]

main_list = ["https://dirtybiologistan.fandom.com/fr/wiki/Sp%C3%A9cial:Recherche?query=&scope=internal&contentType=&ns%5B0%5D=0&ns%5B1%5D=2900"]
new_to_check = ["https://dirtybiologistan.fandom.com/fr/wiki/Sp%C3%A9cial:Recherche?query=&scope=internal&contentType=&ns%5B0%5D=0&ns%5B1%5D=2900"]
//new_to_check = fs.readFileSync("C:\\Users\\Sylicium\\Documents\\DirtyBiologystan\\Projets\\searchEngine\\DibistanSearchEngine\\writtenDown\\REPORT_30-10-2022_02h00m33s_47619_links.txt", "utf-8").match(matchURL2)
// main_list = fs.readFileSync("C:\\Users\\Sylicium\\Documents\\DirtyBiologystan\\Projets\\searchEngine\\DibistanSearchEngine\\writtenDown\\REPORT_30-10-2022_01h11m01s_13969_links.txt", "utf-8").match(matchURL2)
// new_to_check = fs.readFileSync("C:\\Users\\Sylicium\\Documents\\DirtyBiologystan\\Projets\\searchEngine\\DibistanSearchEngine\\writtenDown\\REPORT_30-10-2022_01h11m01s_13969_links.txt", "utf-8").match(matchURL2)


function oneMoreLoop(chunkLength) {
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


    server.emitChanges("startLoop", Date.now())

    server.emitChanges("log", `Starting new loop from main_list=${main_list.length} AND new_to_check=${new_to_check.length} and chunks size=${chunkLength}`)

    server.emitChanges("total_fetching_links", new_to_check.length)

    let loop_start_timestamp = Date.now()
    let old_new_to_check_length = new_to_check.length
    getAllSubLinksOfLinkList_optimised_chunked(new_to_check, chunkLength).then(list => {
        server.emitChanges("endLoop", Date.now())
        let loop_end_timestamp = Date.now()
        server.emitChanges("log", "list:",list)
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
        
        console.log("main_list:",main_list)
        console.log(text_to_log)
        server.emitChanges("log", text_to_log)

        server.emitChanges("total_links", main_list.length)
        server.emitChanges("total_fetching_links", 0)
        server.emitChanges("total_fetched_links", 0)
        server.emitChanges("chunks_processing", 0)
        server.emitChanges("chunks_total", 0)
        server.emitChanges("linksInChunks_processed", 0)
        server.emitChanges("linksInChunks_total", 0)
        server.emitChanges("total_new_links_fetched", 0)
        
    })
}

async function getAllSubLinksOfLinkList(list) {
    let l = []
    let long = list.length
    for(let i in list) {
        //console.log(`${`[${parseInt(i)+1}/${long}]`.padEnd(13," ")} Fetching links of ${list[i]}`)
        let all_l = await getAllLinksInPage_v2(list[i], [
            "dibistan",
            "dirtybiologistan.fandom.com",
            "dirtybiology",
            "dirtybiologistan",
            "micronation",
            "crisardie",
            "drapeau",
            "constitution",
        ])
        console.log(`${`[${parseInt(i)+1}/${long}]`.padEnd(13," ").split("").map(x => { return " "}).join("")}   -> ${all_l.length} links`)
        l.push(all_l)
    }
    return Promise.all(l)
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
        all_l.then((res) => {
            count_fetchedURLs++
            console.log(`${`[${count_fetchedURLs}/${long}]`.padEnd(13," ")} Succesfully fetched ${res.length} links of ${list[i]}`)
            server.emitChanges("add_total_new_links_fetched", res.length)
            server.emitChanges("linksInChunks_processed", count_fetchedURLs)
            server.emitChanges("add_total_fetched_links", 1)
        })
        //console.log(`${`[${parseInt(i)+1}/${long}]`.padEnd(13," ").split("").map(x => { return " "}).join("")}   -> ${all_l.length} links`)
        l.push(all_l)
    }
    return Promise.all(l)
}


/*async function getAllSubLinksOfLinkList_optimised_chunked(list, chunkLength) {
    let chunks = listToChunks(list, chunkLength)
    server.emitChanges("chunks_total", chunks.length)
    let all_list = []
    let long = chunks.length
    for(let i in chunks) {
        server.emitChanges("chunks_processing", parseInt(i)+1)
        console.log(`[${`${parseInt(i)+1}/${long}`}] Getting chunk of ${chunks[i].length} elements`)
        let chunk_processed = await getAllSubLinksOfLinkList_optimised(chunks[i])
        all_list.push(chunk_processed)
    }
    return Promise.all(all_list)
}*/


async function waitToInfinite() { }

async function getAllSubLinksOfLinkList_optimised_chunked(list, chunkLength) {
    let chunks = listToChunks(list, chunkLength)
    server.emitChanges("chunks_total", chunks.length)
    let all_list = []
    let long = chunks.length
    for(let i in chunks) {
        server.emitChanges("chunks_processing", parseInt(i)+1)
        console.log(`[${`${parseInt(i)+1}/${long}`}] Getting chunk of ${chunks[i].length} elements`)
        let chunk_processed = ( await getAllSubLinksOfLinkList_optimised(chunks[i]) ).flat(2)
        chunk_processed = removeDuplicate(chunk_processed, main_list)
        all_list.push(chunk_processed)

        server.emitChanges("total_new_links_fetched", all_list.flat(2).length)
    }
    return Promise.all(all_list)
}

function getDifference(array1, array2) {
    return array1.filter(object1 => {
        return !array2.some(object2 => {
        return object1.id === object2.id;
        });
    });
}

async function getAllLinksInPage_v2(url, mustContainWordsInPage=[]) {
    if(canSpeedUpGettingPageContent(url)) {
        //server.emitChanges("debug", `canSpeedUp url: ${url}`)
        return []
    }
    try {
        let res = await axios.get(url, { timeout: 60*1000 })
        let first_match = res.data.match(matchURL)
        all_matchs = []
        for(let i in first_match) {
            let second_match = first_match[i].match(matchURL2)
            all_matchs = all_matchs.concat(second_match)
        }
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
        return []
    }
}
