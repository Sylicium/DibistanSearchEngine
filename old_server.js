
const axios = require("axios")
const fs = require("fs")

let config = {
    port: 80,
    devmode: true,
}

const express = require('express');
const Discord = require("discord.js");
const app = express();
app.use(express.urlencoded())
app.use(express.json())
const serv = require('http').createServer(app);
const io = require('socket.io')(serv);

const somef = {
    choice: (list) => { return list[Math.floor(Math.random()*list.length)] },
    randHex: (length) => {
        list = "0123456789abcdef"
        return Array(length).fill(null).map(x => { return somef.choice(list) }).join("")
    }
}

const Modules_ = {
    "Discord": Discord,
    "app": app, 
    "config": config,
    "axios": axios,
    "somef": somef,
}

let servEndpoints = {
    api: {
        fs: "/api", // chemin depuis le root du projet et sans le slash de fin
        relative: "/api", // chemin relatif par rapport à ce fichier
    },
    site: {
        fs: "/site", // chemin depuis le root du projet et sans le slash de fin
        relative: "/site", // chemin relatif par rapport à ce fichier
    }
}

let GlobalTemp_ = {
    file: {
        query: fs.readFileSync(`.${servEndpoints.site.fs}/query.html`, "utf-8")
    }
}

function splitAndJoin(text, dict) {
    let new_text = text
    for(let key in dict) {
        new_text = new_text.split(key).join(dict[key])
    }
    return new_text
}

formatTime = (millisecondes, format) => {
    /*
    Renvoie un dictionnaire avec le formatage de la durée en ms, en jour, heures, etc...
    YYYY: year
    MM: month
    DDDDD: jour de l'année
    DD: jours du mois
    hh: heure
    mm: minute
    ss: seconde
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

    let return_string = format.replace("YYYY", la_date.years).replace("MM", formatThis(la_date.months)).replace("DDDDD", la_date.all_days).replace("DD", formatThis(la_date.days)).replace("hh", formatThis(la_date.hours)).replace("mm", formatThis(la_date.minutes)).replace("ss", la_date.seconds).replace("ms", formatThis(la_date.milliseconds, 3))

    return return_string
}

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
    ]
}

function getQueryFile(infos) {
    /*
    infos = {
        query: "blabla"
        result: {
            count: 2
            processTime: 242 // ms
        }
        results
    }
    */
    
    let page;
    if(config.devmode) {
        page = fs.readFileSync(`.${servEndpoints.site.fs}/query.html`, "utf-8")
    } else {
        page = `${GlobalTemp_.file.query}`
    }
    page = splitAndJoin(page, {
        "{{infos.query}}": infos.query,
        "{{infos.result.count}}": infos.result.count,
        "{{infos.result.processTime}}": formatTime(infos.result.processTime, "ss,ms secondes"),
        "{{infos.results}}": infos.results,
    })
    return page
}

module.exports.run = () => {

    app.all("/assets/*", (req, res) => {
        return res.sendFile(`${__dirname}${servEndpoints.site.relative}${req.path}`)
    })
    
    app.all("*", (req, res) => { // tout à la fin sinon le "*" catch à la place des autres app.get()

        console.log(`[Web] ${req.method.toUpperCase()} -> ${req.url}`)
        console.log(req.query)

        if(req.path == "/favicon.ico") return res.sendFile(`${__dirname}${servEndpoints.site.relative}/favicon.ico`)
        if(req.path.startsWith("/api/")) return;
        if(req.path.startsWith("/assets/")) return;

        if(req.path == "/") {

            if(!req.query.query) {
                return res.sendFile(`${__dirname}${servEndpoints.site.relative}/index.html`)
            } else {

                let started_processTime = Date.now()

                let the_results = getLinksByQuery(req.query.query, {
                    from: (req.query.fetchFrom ?? 0),
                    to: (req.query.fetchFrom != undefined ? (req.query.fetchFrom + 100) : 100),// 100 liens max par requete
                })
                let processTime = Date.now() - started_processTime

                /*
                x = {
                    url: "page url",
                    title: "titre",
                    description: "description"
                }
                */
                the_results = the_results.map(x => {
                    return `<div class="searchResult">
<div class="urlPreview">
    <img class="urlFavicon" src="https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${x.url}?size=128">
    ${x.advertisement ? "<span class='advertisement'>Annonce</span>" : ""}
    ${x.verified ? "<span class='verified'>Vérifié</span>" : ""}
    ${urlToSpan(x.url)}
</div>
<div class="title">
    <a href="${x.url}" onclick="clickedOnLink(this)">${x.title}</a>
</div>
<div class="description">${x.description}</div>
                </div>`
                })

                let file = getQueryFile({
                    query: req.query.query,
                    result: {
                        count: the_results.length,
                        processTime: processTime
                    },
                    results: the_results.join("")
                })

                return res.send(file)
            }

        } else if(req.path.endsWith("/") && fs.existsSync(`.${servEndpoints.site.fs}${req.path}/index.html`)) {
            return res.sendFile(`${__dirname}${servEndpoints.site.relative}${req.path}/index.html`)
        } else if(fs.existsSync(`.${servEndpoints.site.fs}${req.path}.html`)) {
            return res.sendFile(`${__dirname}${servEndpoints.site.relative}${req.path}.html`)
        } else {
            return res.sendFile(`${__dirname}${servEndpoints.site.relative}/404.html`)
        }

    })


    io.on("connection", (socket) => {
        console.log(`[SOCKET] New socket ${socket.id}`)

        socket.on("oneMoreLoop", (chunkSize) => {
            functions.oneMoreLoop(chunkSize)
        })

        socket.on("writeDown", (chunkSize) => {
            functions.writeDown(chunkSize)
        })

    })

    serv.listen(config.port, () => {
        console.info(`Serveur démarré sur le port ${config.port}`)
    })

}


module.exports.emitChanges = (name, value) => {
    io.emit(name, value)
}



let functions = undefined
module.exports.setFunctions = funcs => {
    functions = funcs
}