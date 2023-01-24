
/**
 * @name DibsilonIndexer
 * @description L'Algorithme d'indexation du moteur de recherche Dibim.
 * @date 18/12/2022
 * @author Sylicium
 * @version 0.4.1-alpha
*/
const Version = "0.4.1-alpha";

const somef = require("../localModules/someFunctions")

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

        fs.appendFileSync(`C:\\Users\\Sylicium\\Documents\\DirtyBiologystan\\Projets\\searchEngine\\DibistanSearchEngine\\writtenDown\\${fileName}`, the_content)
    },
}

server.setFunctions(functionlist)

/*
getAllLinksInPage_v2(list[i], [
            "dibistan",
            "dirtybiologistan.fandom.com",
            "dirtybiology",
            "dirtybiologistan",
            "micronation",
            "crisardie",
            "drapeau",
            "constitution",
        ])

        
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

*/

let somef = {
    textIncludeAny: (text, list) => {
        if(list.length == 0) return false;
        text = text.toLowerCase()
        for(let i in list) {
            if(text.includes(list[i].toLowerCase())) return true
        }
        return false
    }
}

class new_DibsilonIndexer {
    constructor(version) {
        this.version = version
        this.inFetch = [
            {
                url: "blablabla",
                startedAt: "timestamp",
                expireAt: "expire timestamp"
            }
        ]
    }

    canSpeedUpGettingPageContent(url) {
        if(url == undefined) return true
        if(url.includes("https://discord.gift/")) {
            fs.appendFileSync("C:\\Users\\Sylicium\\Documents\\DirtyBiologystan\\Projets\\searchEngine\\DibistanSearchEngine\\fetchNewLinks\\NITRO_SCRAPPED.txt", `\n${url}`)
            return true
        }
        
        let speedUpLinks = {
            "includes": [
            ],
            "endsWith": [
                //".png", ".jpg", ".jpeg", ".mp4", ".mp3", ".mov", ".wav", ".webp", ".svg", ".json", ".ttl", ".woff", ".rdf"
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
                //"https://onepiece.fandom.com/",
            ]
        }

        function checkTextAny_callback(test, list, callback) {
            for(let i in list) {
                if(callback(test, list[i])) return true
            }
            return false
        }

        if(somef.textIncludeAny(url, speedUpLinks.includes)) return true
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

    /**
     * f(): Retourne un dictionnaire contenant la liste des keyword avec le score pour la page donnée.
     * @param {string} document - The HTML document already passed through DOMParser()
     * @param {Array} keywordList - Array of all the keywords
     * @returns Object { "keyword": score }
     */
    calcPageScoreByKeyword_forList(document, keywordList) {
        let dict = {}
        for(let i in keywordList) {
            dict[keywordList[i]] = this.calcPageScoreByKeyword(document, keywordList[i])
        }
        return dict
    }

    /**
     * f(): Retourne le score de match pour le keyword sur la page. ! Deja préformater le keyword en lowercase et sans accent.
     * @param {*} document 
     * @param {*} keyword 
     */
    calcPageScoreByKeyword(document, keyword) {
        let keyword_reg = somef._normalizeRegex(keyword)
        let score = 0
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
        let page_title = (page_title_elem.length > 0 ? page_title_elem[0].textContent.toLowerCase() : "")

        if(document.location.href.match(keyword_reg)) score+= 150
        if(page_title.match(keyword_reg)) score+= 100

        function getAllTagsContent(tagName) {
            return [...htmlPage.getElementsByTagName(tagName)].map(x => { return x.textContent }).join(" ")
        }
        if(getAllTagsContent("h1").match(keyword_reg)) score+= 85
        if(getAllTagsContent("h2").match(keyword_reg)) score+= 75
        if(getAllTagsContent("h3").match(keyword_reg)) score+= 60
        if(getAllTagsContent("h4").match(keyword_reg)) score+= 50
        if(getAllTagsContent("h5").match(keyword_reg)) score+= 45
        if(getAllTagsContent("h6").match(keyword_reg)) score+= 40
        if(getAllTagsContent("p").match(keyword_reg)) score+= 40
        if(getAllTagsContent("a").match(keyword_reg)) score+= 50
        if(getAllTagsContent("span").match(keyword_reg)) score+= 30
        
    }


    fetchURL(url) {

        (async () => {
            let datas = {}

            DibsilonIndexer.fetchedURL(url, datas)
        })()

    }

    fetchedURL(url, datas) {

    }

}


let DibsilonIndexer = new new_DibsilonIndexer(Version)