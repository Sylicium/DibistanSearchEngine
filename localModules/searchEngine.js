


module.exports.SearchEngineManager = class {
    constructor() {

    }


}


module.exports.highlightKeywords = (query, description) => {

    let query_list = query.split(" ").map(x => { return x.trim() })
    let description_list = description.split(" ").map(x => { return x.trim() })

    description_list = description_list.map(x => {
        if(query_list.includes(x)) return `<span class="keyword">${x}</span>`
        else return x
    })
    return description_list.join(" ")
}

module.exports.getFaviconUrl = (websiteURL) => {
    return `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${websiteURL}?size=128`
}

module.exports.urlToSpan =(url) => {
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


module.exports.getLinksByQuery = (query, infos) => {
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
            url: `https://google.com/${somef.randHex(8)}/${somef.randHex(8)}/${somef.randHex(8)}`,
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