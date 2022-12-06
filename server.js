
const axios = require("axios")
const fs = require("fs")

let config = require("./config")

const express = require('express');
const Discord = require("discord.js");
const app = express();
var cookieParser = require('cookie-parser');
app.use(cookieParser());
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
        "{{infos.result.processTime}}": somef.formatTime(infos.result.processTime, "ss,ms secondes"),
        "{{infos.results}}": infos.results,
        "{{infos.colorTheme}}": infos.colorTheme,
        "{{infos.colorTheme_svgPlace}}": (infos.colorTheme == "theme-white" ? SE.Datas.svg.moon : SE.Datas.svg.sun),
    })
    return page
}

module.exports.run = () => {

    app.all("/assets/*", (req, res) => {
        return res.sendFile(`${__dirname}${servEndpoints.site.relative}${req.path}`)
    })
    
    app.all("*", async (req, res) => { // tout à la fin sinon le "*" catch à la place des autres app.get()

        console.log(`[Web] ${req.method.toUpperCase()} -> ${req.url}`)
        console.log(req.query)

        if(req.path == "/favicon.ico") return res.sendFile(`${__dirname}${servEndpoints.site.relative}/favicon.ico`)
        if(req.path.startsWith("/api/")) return;
        if(req.path.startsWith("/assets/")) return;

        if(req.path == "/") {

            if(!req.query.query) {
                return res.sendFile(`${__dirname}${servEndpoints.site.relative}/index.html`)
            } else {

                req.query.query = req.query.query.trim()

                let started_processTime = Date.now()

                let AllLinksAndCountLinks_byQuery = await SE.getLinksByQuery(req.query.query, {
                    from: (req.query.fetchFrom ?? 0),
                    to: (req.query.fetchFrom != undefined ? (req.query.fetchFrom + 100) : 100),// 100 liens max par requete
                })
                let processTime = Date.now() - started_processTime
                /*
                AllLinksAndCountLinks_byQuery = {
                    count: nombre total de documents,
                    fetched: max 20 documents fetch par rapport au req.query.start
                }
                */

                /*
                x = {
                    url: "page url",
                    title: "titre",
                    description: "description"
                }
                */
                let resultsToDraw = AllLinksAndCountLinks_byQuery.fetched.map(x => {
                    return SE.getHTMLResultChunk(req.query.query, x)
                })

                if(resultsToDraw.length == 0) {
                    resultsToDraw = [SE.getNoResultToQueryChunk()]
                }

                let colorTheme = `${ (req.cookies.colorTheme != undefined && req.cookies.colorTheme == "white" ) ? "theme-white" : "theme-dark"}`
                if(req.query.forceTheme != undefined) {
                    if(req.query.forceTheme == "dark") { colorTheme = "theme-dark" }
                    else if(req.query.forceTheme == "white") { colorTheme = "theme-white" }
                }

                let file = getQueryFile({
                    query: req.query.query,
                    result: {
                        count: AllLinksAndCountLinks_byQuery.count,
                        processTime: processTime
                    },
                    colorTheme: colorTheme,
                    results: resultsToDraw.join(""),
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