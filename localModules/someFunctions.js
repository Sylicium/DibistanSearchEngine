


let choice = (list) => { return list[Math.floor(Math.random()*list.length)] }
module.exports.choice = choice

let randHex = (length) => {
    list = "0123456789abcdef"
    return Array(length).fill(null).map(x => { return choice(list) }).join("")
}
module.exports.randHex = randHex


module.exports.splitAndJoin = splitAndJoin
function splitAndJoin(text, dict) {
    let new_text = text
    for(let key in dict) {
        new_text = new_text.split(key).join(dict[key])
    }
    return new_text
}

module.exports.capitalize = (str) => { return `${str[0].toUpperCase()}${str.slice(1)}` }

module.exports.formatTime = formatTime
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

module.exports.getKeywords = getKeywords
function getKeywords(query) {
    return query.toLowerCase().match(/[\p{L}]{3,}/gu).map(x => { return x.trim() })
}

function sleep(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}
module.exports.sleep = sleep

function genHex() { return "zrgfnkergkjn" }
module.exports.genHex = this.genHex

function any(list1, list2) {
    for(let i in list1) {
        if(i in list2) return true
    }
    return false
}
module.exports.any = any

function removeDuplicate(list) { return list.filter((x, i) => i === list.indexOf(x)) }
module.exports.removeDuplicate = removeDuplicate