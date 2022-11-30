
const axios = require("axios")
const fs = require("fs")

let config = require("./config")

const express = require('express');
const Discord = require("discord.js");
const app = express();
app.use(express.urlencoded())
app.use(express.json())
const serv = require('http').createServer(app);
const io = require('socket.io')(serv);

const somef = require("./localModules/someFunctions")
const SE = require("./localModules/searchEngine")

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
    pages: {
        query: fs.readFileSync(`.${servEndpoints.site.fs}/query.html`, "utf-8")
    }
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
        page = `${GlobalTemp_.pages.query}`
    }
    page = somef.splitAndJoin(page, {
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

                let the_results = SE.getLinksByQuery(req.query.query, {
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
    <img class="urlFavicon" src="${SE.getFaviconUrl(x.url)}">
    ${x.advertisement ? "<span class='advertisement'>Annonce</span>" : ""}
    ${x.verified ? "<span class='verified'>Vérifié</span>" : ""}
    ${SE.urlToSpan(x.url)}
</div>
<div class="title">
    <a href="${x.url}" onclick="clickedOnLink(this)">${x.title}</a>
</div>
<div class="description">${SE.highlightKeywords(req.query.query, x.description)}</div>
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

    serv.listen(config.server.port, () => {
        console.info(`Serveur démarré sur le port ${config.server.port}`)
    })

}


module.exports.emitChanges = (name, value) => {
    io.emit(name, value)
}



let functions = undefined
module.exports.setFunctions = funcs => {
    functions = funcs
}