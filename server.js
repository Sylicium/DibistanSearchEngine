
const axios = require("axios")
const fs = require("fs")

let config = {
    port: 80,
}

const express = require('express');
const Discord = require("discord.js");
const app = express();
app.use(express.urlencoded())
app.use(express.json())
const serv = require('http').createServer(app);
const io = require('socket.io')(serv);

const Modules_ = {
    "Discord": Discord,
    "app": app, 
    "config": config,
    "axios": axios
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
            return res.sendFile(`${__dirname}${servEndpoints.site.relative}/index.html`)
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