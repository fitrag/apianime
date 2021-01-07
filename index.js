const cheerio = require('cheerio')
const express = require('express')
const axios = require('axios')
const baseUrl = require('./url')
const port = Process.env.PORT || 3000
const app = express()

app.get("/manga", (req, res) => {
    try{
    axios.get(baseUrl + "manga/?order=update")
.then(response => {
    const $ = cheerio.load(response.data)
    const perapih = $("#content")

    let manga_list = [];
    let link,title,img, chapter, type;

    perapih.find(".wrapper > .postbody > .bixbox > .mrgn > .listupd > .bs").each((id, el) => {
        link    = $(el).find(".bsx > a").attr('href').replace(baseUrl, "")
        img     = $(el).find(".bsx > a").find("img").attr('src').replace("?resize=165,225","")
        type    = $(el).find(".bsx > a").find(".type").text()
        title   = $(el).find(".bsx > a").find(".tt").text().trim()
        chapter = $(el).find(".bsx > a").find(".epxs").text()

        manga_list.push({
            title,
            img,
            type,
            link,
            chapter
        })
    })

    res.json(manga_list)
}).catch(e=>{
    res.send({
        status:500,
        msg:"Sepertinya ada yang tidak beres"
    })
})}catch{
    console.log("updss")
}
})

app.get("/manga/detail/:slug", (req, res) => {
    const slug = req.params.slug
    
    axios.get(baseUrl + "manga/" + slug)
    .then(response => {
        const $ = cheerio.load(response.data)
        const perapih = $("#content")
        
        const detailManga = {}
        let genre_list = []
        let chapter_list = []
        let judul,img,status,type,sinopsis
        
        perapih.find(".wrapper > .postbody > .hentry").each((id, el) => {
            
            detailManga.img = $(el).find(".bigcover > .ime").find("img").attr('src')
            detailManga.status = $(el).find(".bigcontent > .thumbook > .rt > .tsinfo").find("i").text()
            detailManga.type = $(el).find(".bigcontent > .thumbook > .rt > .tsinfo").find("a").text()
            detailManga.judul = $(el).find(".bigcontent > .infox").find("h1").text()
            detailManga.sinopsis = $(el).find(".bigcontent > .infox > .wd-full > .entry-content-single").find("p").text()
        })
        
        perapih.find(".wrapper > .postbody > .hentry > .bixbox > .bigcontent > .infox > .wd-full > .mgen > a").each((id, el) => {
            let genre_name = $(el).text()
            genre_list.push({
                genre_name,
            })
            detailManga.genre_list = genre_list
        })
        
        perapih.find(".wrapper > .postbody > .hentry > .bixbox > .eplister > ul > li").each((id, el) => {
            let link   = $(el).find(".chbox > .eph-num").find("a").attr("href").replace(baseUrl,"")
            let chapter   = $(el).find(".chbox").find("a > .chapternum").text()
            chapter_list.push({
                chapter,
                link
            })
            detailManga.chapter_list = chapter_list
        })
        
        res.json(detailManga)
    })
    
})

const ambil = async (slug) => {
    try{
        let res = await axios.get("https://komikcast.com/chapter/solo-leveling-chapter-134-bahasa-indonesia/")
        return res
    }catch(err){
        console.log(err)
    }

}
app.get("/chapter/:slug", (req,res) => {
    const slug = req.params.slug
    axios.get("https://komikcast.com/chapter/" + slug)
    .then(response => {
        const $ = cheerio.load(response.data)
        const perapih = $("#content")
        const obj = {}
        let chapter_list = []

        perapih.find(".wrapper > .chapterbody > .postarea > article").each((id, el) => {
            obj.title = $(el).find(".headpost").find("h1").text()
        })

        perapih.find(".wrapper > .chapterbody > .postarea > article > .maincontent > #readerarea > img").each((id, el) => {
            chapter_image = $(el).attr("src").replace("https://cdn.komikcast.com/","http://cdn.komikcast.com/")
            chapter_list.push({
                chapter_image,
                chapter_number: id
            })
            obj.chapter_list = chapter_list
        })
        res.json(obj)
    })
    
        
})

        
    app.listen(port, function () {
        console.log("Started application on port %d", 10000)
    });
    
