

let somef = require("./someFunctions")
let Database = require("../fetchNewLinks/databaseParser")
const googlethis = require("googlethis")

module.exports.SearchEngineManager = class {
    constructor() {

    }


}


module.exports.highlightKeywords = highlightKeywords
function highlightKeywords(query, description) {
    // pass
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
        //console.log("temp:",temp)
    for(let i=0; i< temp.length; i++) {
        //console.log("temp i:",temp[i])
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
async function getLinksByQuery(query, infos) {
    // pass
}


module.exports.getHTMLResultChunk = getHTMLResultChunk
function getHTMLResultChunk(query, urlDBObject) {
    //console.log("urlDBObject",urlDBObject.url)
    let urlToSpanObject;
    try {
        urlToSpanObject = urlToSpan(decodeURI(urlDBObject.url))
    } catch(err) {
        urlToSpanObject = urlToSpan(decodeURI(`${urlDBObject.url}`.split("?")[0]))
    }
    
    let the_list = []
    if(urlDBObject.advertisement) the_list.push("advertisement")
    if(urlDBObject.verified) the_list.push("verified")
    if(urlDBObject.googleResult) the_list.push("googleResult")
    return `<div class="searchResult${the_list.length > 0 ? " "+the_list.join(" ") : ""}">
        <div class="urlPreview">
        <img class="urlFavicon" src="${getFaviconUrl(urlDBObject.url)}">
        ${urlDBObject.advertisement ? "<span class='advertisement' title='Ce résultat est une annonce ou autre type de sponsorisation.'>Annonce</span>" : ""}
        ${urlDBObject.verified ? "<span class='verified' title='Ce résultat a été vérifié par Dibim'>Vérifié</span>" : ""}
        ${urlDBObject.googleResult ? "<span class='googleResult' title='Ce résultat est issu de Google, et non de Dibim.'>Résultat Google</span>" : ""}
        ${urlToSpanObject}
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



let Datas = {
    svg: {
        moon: `<svg class="logo" preserveAspectRatio="xMidYMin" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="css-101apn4" style="vertical-align: middle;"><path fill-rule="evenodd" clip-rule="evenodd" d="M11.8634 2.63177C12.0085 2.8893 11.9889 3.20808 11.8131 3.4458C10.9233 4.64961 10.4952 6.13281 10.6065 7.62564C10.7178 9.11846 11.3612 10.5217 12.4198 11.5803C13.4783 12.6388 14.8816 13.2822 16.3744 13.3935C17.8672 13.5049 19.3504 13.0767 20.5542 12.1869C20.7919 12.0112 21.1107 11.9915 21.3683 12.1366C21.6258 12.2818 21.774 12.5646 21.7468 12.859C21.5764 14.7031 20.8844 16.4605 19.7516 17.9255C18.6189 19.3906 17.0923 20.5028 15.3505 21.1319C13.6087 21.7611 11.7238 21.8811 9.9163 21.4781C8.10878 21.0751 6.45342 20.1656 5.14392 18.8561C3.83442 17.5466 2.92494 15.8912 2.52191 14.0837C2.11887 12.2762 2.23895 10.3913 2.86809 8.6495C3.49723 6.90773 4.60941 5.38116 6.07449 4.24841C7.53957 3.11566 9.29695 2.42359 11.141 2.25318C11.4354 2.22598 11.7183 2.37423 11.8634 2.63177ZM9.7469 4.03638C8.75314 4.32369 7.8177 4.79668 6.99198 5.43509C5.7523 6.39357 4.81123 7.68528 4.27888 9.15909C3.74653 10.6329 3.64492 12.2278 3.98595 13.7573C4.32698 15.2867 5.09654 16.6874 6.20458 17.7954C7.31262 18.9035 8.7133 19.673 10.2427 20.0141C11.7722 20.3551 13.3671 20.2535 14.8409 19.7211C16.3147 19.1888 17.6065 18.2477 18.5649 17.008C19.2033 16.1823 19.6763 15.2469 19.9636 14.2531C18.8087 14.7619 17.5386 14.9845 16.2628 14.8894C14.4117 14.7513 12.6717 13.9535 11.3591 12.6409C10.0465 11.3284 9.24867 9.58829 9.11063 7.73719C9.01549 6.46141 9.23812 5.19131 9.7469 4.03638Z"></path></svg>`,
        sun: `<svg class="logo" preserveAspectRatio="xMidYMin" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="css-101apn4" style="vertical-align: middle;"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 7.75C9.65279 7.75 7.75 9.65279 7.75 12C7.75 14.3472 9.65279 16.25 12 16.25C14.3472 16.25 16.25 14.3472 16.25 12C16.25 9.65279 14.3472 7.75 12 7.75ZM6.25 12C6.25 8.82436 8.82436 6.25 12 6.25C15.1756 6.25 17.75 8.82436 17.75 12C17.75 15.1756 15.1756 17.75 12 17.75C8.82436 17.75 6.25 15.1756 6.25 12Z"></path><path d="M1 11.25C0.585786 11.25 0.25 11.5858 0.25 12C0.25 12.4142 0.585787 12.75 1 12.75H3C3.41421 12.75 3.75 12.4142 3.75 12C3.75 11.5858 3.41421 11.25 3 11.25H1Z"></path><path d="M21 11.25C20.5858 11.25 20.25 11.5858 20.25 12C20.25 12.4142 20.5858 12.75 21 12.75H23C23.4142 12.75 23.75 12.4142 23.75 12C23.75 11.5858 23.4142 11.25 23 11.25H21Z"></path><path d="M19.2478 20.3085C19.5407 20.6014 20.0156 20.6014 20.3085 20.3085C20.6014 20.0156 20.6014 19.5407 20.3085 19.2478L18.8943 17.8336C18.6014 17.5407 18.1265 17.5407 17.8336 17.8336C17.5407 18.1265 17.5407 18.6014 17.8336 18.8943L19.2478 20.3085Z"></path><path d="M5.10571 6.16637C5.3986 6.45926 5.87348 6.45926 6.16637 6.16637C6.45926 5.87348 6.45926 5.3986 6.16637 5.10571L4.75216 3.6915C4.45926 3.3986 3.98439 3.3986 3.6915 3.6915C3.3986 3.98439 3.3986 4.45926 3.6915 4.75216L5.10571 6.16637Z"></path><path d="M3.6915 19.2478C3.3986 19.5407 3.3986 20.0156 3.6915 20.3085C3.98439 20.6014 4.45926 20.6014 4.75216 20.3085L6.16637 18.8943C6.45926 18.6014 6.45926 18.1265 6.16637 17.8336C5.87348 17.5407 5.3986 17.5407 5.10571 17.8336L3.6915 19.2478Z"></path><path d="M17.8336 5.10571C17.5407 5.3986 17.5407 5.87348 17.8336 6.16637C18.1265 6.45926 18.6014 6.45926 18.8943 6.16637L20.3085 4.75216C20.6014 4.45926 20.6014 3.98439 20.3085 3.6915C20.0156 3.3986 19.5407 3.3986 19.2478 3.6915L17.8336 5.10571Z"></path><path d="M11.25 23C11.25 23.4142 11.5858 23.75 12 23.75C12.4142 23.75 12.75 23.4142 12.75 23V21C12.75 20.5858 12.4142 20.25 12 20.25C11.5858 20.25 11.25 20.5858 11.25 21V23Z"></path><path d="M11.25 3C11.25 3.41421 11.5858 3.75 12 3.75C12.4142 3.75 12.75 3.41421 12.75 3V1C12.75 0.585787 12.4142 0.25 12 0.25C11.5858 0.25 11.25 0.585787 11.25 1V3Z"></path></svg>`,
    }
}
module.exports.Datas = Datas
