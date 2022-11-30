

let somef = require("./someFunctions")


module.exports.SearchEngineManager = class {
    constructor() {

    }


}


module.exports.highlightKeywords = highlightKeywords
function highlightKeywords(query, description) {

    let query_list = query.split(" ").map(x => { return x.trim().toLowerCase() })
    let description_list = description.split(" ").map(x => { return x.trim() })

    description_list = description_list.map(x => {
        if(query_list.includes(x.toLowerCase())) return `<span class="keyword">${x}</span>`
        else return x
    })
    return description_list.join(" ")
}

module.exports.getFaviconUrl = getFaviconUrl
function getFaviconUrl(websiteURL) {
    return `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${websiteURL}?size=128`
}

module.exports.urlToSpan = urlToSpan
function urlToSpan(url) {
    temp = url
    temp = temp.replace("https://","")
    temp = temp.replace("http://","")
    temp = temp.split("?")[0]
    temp = temp.split("/")
    list = []
    console.log("temp:",temp)
    for(let i=0; i< temp.length; i++) {
        console.log("temp i:",temp[i])
        if(i == 0) {
            list.push(`<span class="domain">${temp[i]}</span>`)
        } else {
            if(temp[i].length == 0) continue;
            list.push(`<span>${temp[i]}</span>`)
        }
    }
    str = list.join(`<span> › </span>`)
    return str
}


module.exports.getLinksByQuery = getLinksByQuery
function getLinksByQuery(query, infos) {
    /*
    infos = {
        from: (req.query.fetchFrom ?? 0),
        to: (req.query.fetchFrom != undefined ? (req.query.fetchFrom + 100) : 100),// 100 liens max par requete
    }
    */

    return [
        {
            url: `https://google.com/${somef.randHex(8)}/${somef.randHex(8)}/${somef.randHex(8)}`,
            title: somef.randHex(16),
            description: somef.randHex(100),
        },
        {
            url: `https://google.com/${somef.randHex(8)}/${somef.randHex(8)}`,
            title: somef.randHex(16),
            description: somef.randHex(100),
        },
        {
            url: `https://google.com/`,
            title: somef.randHex(16),
            description: somef.randHex(100),
        },
        {
            url: `https://stackoverflow.com/${somef.randHex(8)}/${somef.randHex(8)}/${somef.randHex(8)}?search=coucou&ekfhzerf=zeflkjbzf&zojhf=efzffe`,
            title: somef.randHex(16),
            description: somef.randHex(100),
        },
        {
            url: `https://google.com/`,
            title: somef.randHex(16),
            description: somef.randHex(100),
        },
        {
            url: `https://google.com/${somef.randHex(8)}/${somef.randHex(8)}/${somef.randHex(8)}`,
            title: somef.randHex(16),
            description: somef.randHex(100),
        },
        {
            url: `https://google.com/${somef.randHex(8)}/${somef.randHex(8)}/${somef.randHex(8)}`,
            title: somef.randHex(16),
            description: somef.randHex(100),
        },
        {
            url: `https://google.com/${somef.randHex(8)}/${somef.randHex(8)}/${somef.randHex(8)}`,
            title: somef.randHex(16),
            description: `site répertorie, liste, rencense et propose à chacun de rejoindre l'ensemble des discords qui sont en lien avec la micronation.
            Que le discord soit lié de près ou de loin à la micronation, il est possible qu'il soit référencé ici.`
        },
        {
            url: `https://google.com/${somef.randHex(8)}/${somef.randHex(8)}/${somef.randHex(8)}`,
            title: somef.randHex(16),
            description: `Bot du DirtyBiologistan, le bot qui permet une synchronisation des données autour de la micronation du DirtyBiologistan.
            Ce bot est également le seul à l'heure actuelle qui permet de lier votre discord à votre pixel et ce de manière officielle`
        }
    ]
}


module.exports.getHTMLResultChunk = getHTMLResultChunk
function getHTMLResultChunk(query, urlDBObject) {
    return `<div class="searchResult">
        <div class="urlPreview">
        <img class="urlFavicon" src="${getFaviconUrl(urlDBObject.url)}">
        ${urlDBObject.advertisement ? "<span class='advertisement'>Annonce</span>" : ""}
        ${urlDBObject.verified ? "<span class='verified'>Vérifié</span>" : ""}
        ${urlToSpan(urlDBObject.url)}
        </div>
        <div class="title">
        <a href="${urlDBObject.url}" onclick="clickedOnLink(this)">${urlDBObject.title}</a>
        </div>
        <div class="description">${highlightKeywords(query, somef.capitalize(urlDBObject.description))}</div>
    </div>`
}

module.exports.getNoResultToQueryChunk = getNoResultToQueryChunk
function getNoResultToQueryChunk() {
    return `<div class="searchResult noResult">
        <div class="description">
        <svg class="logoInfo" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 1024 1024" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path><path d="M464 688a48 48 0 1 0 96 0 48 48 0 1 0-96 0zm24-112h48c4.4 0 8-3.6 8-8V296c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v272c0 4.4 3.6 8 8 8z"></path></svg>
        Aucun résultat trouvé.</div>
    </div>`
}