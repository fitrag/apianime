const cheerio = require('cheerio')
const express = require('express')
const axios = require('axios')
const PORT = process.env.PORT || 3000
const cors = require('cors')
const baseUrl = require('./url')
const app = express()

app.use(cors())
app.get("/manga", (req, res) => {
    try{
    axios.get(baseUrl + "manga/?order=update")
.then(response => {
    const $ = cheerio.load(response.data)
    const perapih = $("#content")

    let manga_list = [];
    let link,title,img, chapter, type;

    perapih.find(".wrapper > .postbody > .bixbox > .mrgn > .listupd > .bs").each((id, el) => {
        link    = $(el).find(".bsx > a").attr('href').replace(baseUrl+"manga/", "")
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

app.get("/chapter/:slug", (req,res) => {
    const slug = req.params.slug.replace("-bahasa-indonesia"," ")
    console.log(slug)
    axios.get("https://komikindo.co/" + slug)
    .then(response => {
        // console.log(response)
        const $ = cheerio.load(response.data)
        const perapih = $("#content")
        const obj = {}
        let chapter_list = []

        perapih.find(".wrapper > .chapterbody > .postarea > article").each((id, el) => {
            obj.title = $(el).find(".headpost").find("h1").text()
        })

        perapih.find(".wrapper > .chapterbody > .postarea > article > .maincontent > #readerarea > p > img").each((id, el) => {
            chapter_image = $(el).attr("src").replace("https://cdn.komikcast.com/","http://cdn.komikcast.com/")
            chapter_list.push({
                chapter_image,
                chapter_number: id
            })
            obj.chapter_list = chapter_list
        })
        res.json(obj)
    }).catch(e =>{
        res.send({
            status:503,
            message:"Gagal mengambil chapter"
        })
    })
    
        
})

app.get("/search/:query/:page", (req, res) => {
    const query = req.params.query
    const pageId = parseInt(req.params.page)

    const data = {}
    let search_result = []

    data.currentPage = pageId
    data.nextPage = pageId + 1

    let url = (pageId === 1) ? 'https://komikindo.co/?s=' + query : 'https://komikindo.co/page/' + pageId + '/?s=' + query
    axios.get(url)
    .then(response => {
        const $ = cheerio.load(response.data)
        const content = $(".listupd")
        content.find(".bs").each((id, el) => {
            let link = $(el).find(".bsx > a").attr("href").replace("https://komikindo.co/manga/","")
            let title = $(el).find(".bsx > a > .bigor > .tt").text()
            let chapter = $(el).find(".bsx > a > .bigor > .adds > .epxs").text()
            let img = $(el).find(".bsx > a > .limit").find("img").attr("src")
            let type = $(el).find(".bsx > a > .limit").find(".type").text()

            search_result.push({
                title,
                img,
                type,
                chapter,
                link
            })
            data.search_result = search_result
        })
        res.json(data)
    })
})

app.get("/detail/search/:slug", (req, res) => {
    const slug = req.params.slug
    axios.get("https://komikindo.co/manga/" + slug)
    .then(response => {
        const $ = cheerio.load(response.data)
        const content = $(".postbody")

        const detailManga = {}
        let chapter_list = []

        content.find("article").each((id, el) => {
            detailManga.img = $(el).find(".bigcover > .ime").find("img").attr('src')
            detailManga.judul = $(el).find(".bigcontent > .infox").find("h1").text()
            detailManga.sinopsis = $(el).find(".bigcontent > .infox > .desc").find("p").text()
        })

        content.find(".hentry > .bixbox > ul > li").each((id, el) => {
            let link   = $(el).find(".lchx").find("a").attr("href").replace("https://komikindo.co/","")
            let chapter   = $(el).find(".lchx").find("a").text()
            chapter_list.push({
                chapter,
                link
            })
            detailManga.chapter_list = chapter_list
        })

        res.json(detailManga)
    })
})

// Manga Other API v2

app.get("/manga/v2/page/:id", (req, res) => {
    const pageId = parseInt(req.params.id)
    let url = pageId == 1 ? 'https://komikcast.com/daftar-komik/?order=update' : 'https://komikcast.com/daftar-komik/page/' + pageId +'/?order=update'
    try{
        axios.get(url)
        .then(response => {
            const $ = cheerio.load(response.data)
            const content = $(".bixbox")

            const obj = {}

            let anime = []


            obj.currentPage = pageId
            obj.nextPage = pageId + 1

            // console.log(response.data)

            content.find(".mrgn > .listupd > .bs").each((id,el) => {
                let img = $(el).find(".bsx > a > .limit").find("img").attr("src")
                let judul = $(el).find(".bsx > .bigor > a > .tt").text().trim()
                let chapter = $(el).find(".bsx > .bigor > .adds > .epxs > a").text().trim()
                let link = $(el).find(".bsx > a").attr("href").replace("https://komikcast.com/komik/","").replace("/","")
                let type = $(el).find(".bsx > a > .limit").find(".type").text()
                // let img = $(el).find(".bsx > a > .limit").find("img").attr("src")
                anime.push({
                    judul,
                    img,
                    type,
                    chapter,
                    link
                })

                obj.anime_list = anime
            })

            res.json(obj)

        })
    }catch{
        res.json({
            message:"Ups error"
        })
    }
})

app.get("/manga/v2/detail/:slug", (req, res) => {
    const slug = req.params.slug

    console.log(slug)
    try{
        axios.get("https://komikcast.com/komik/" + slug)
        .then(response => {
            const $ = cheerio.load(response.data)
            const content = $("article")

            const obj = {}
            let chapter = []
            let detail = []

            content.find(".animefull > .bigcover > .ime").each((id, el) => {
                obj.img = $(el).find("img").attr("src")
            })

            content.find(".animefull > .bigcontent > .infox").each((id, el) => {
                let title = $(el).find("h1").text()
                let alter_title = $(el).find(".alter").text()
                let genres = $(el).find(".spe > span:nth-child(1)").text().replace("Genres: ","")
                let status = $(el).find(".spe > span:nth-child(2)").text().replace("Status:","").trim()
                let released = $(el).find(".spe > span:nth-child(3)").text().replace("Released:","").trim()
                let author = $(el).find(".spe > span:nth-child(4)").text().replace("Author:","").trim()
                let type = $(el).find(".spe > span:nth-child(5)").text().replace("Type:","").trim()

                detail.push({
                    title,
                    alter_title,
                    genres,
                    status,
                    released,
                    author,
                    type
                })
                obj.anime_detail = detail
            })

            content.find(".animefull > .desc > div > p").each((id, el) => {
                obj.sinopsis = $(el).text()
            })

            content.find(".bixbox > .cl > ul > li").each((id, el) => {
                let chapter_name = $(el).find(".leftoff").text()
                let chapter_link = $(el).find(".leftoff > a").attr("href").replace("https://komikcast.com/chapter/","").replace("/","")

                chapter.push({
                    chapter_name,
                    chapter_link
                })

                obj.chapter_list = chapter
            })

            res.json(obj)
            

        }).catch(() => {
            res.send({
                message:"Something wrong"
            })
        })
    }catch{
        res.send({
            message:"Something wrong"
        })
    }
})

app.get("/manga/v2/chapter/:slug", (req, res) => {
    const slug = req.params.slug
    try{
        axios.get("https://komikcast.com/chapter/" + slug)
        .then(response => {
            const $ = cheerio.load(response.data)
            const content = $(".postarea")

            let chapter = []
            const obj = {}

            

            content.find("article > .maincontent > .nextprev").each((id,el) => {
                obj.next_link = $(el).find("a:nth-child(2)").attr("href").replace("https://komikcast.com/chapter/","").replace("/","")
            })

            content.find("article > .maincontent > .nextprev").each((id,el) => {
                obj.prev_link = $(el).find("a:nth-child(1)").attr("href").replace("https://komikcast.com/chapter/","").replace("/","")
            })

            content.find("article > .maincontent > #readerarea > img").each((id,el) => {
                let chapter_image = $(el).attr("src")

                chapter.push({
                    chapter_image,
                    chapter_number : id
                })

                obj.chapter = chapter
            })

            res.json(obj)
            

        }).catch(() => {
            res.send({
                message:"Something wrong"
            })
        })
    }catch{
        res.send({
            message:"Something wrong"
        })
    }
})

        
    app.listen(PORT, function () {
        console.log("Started application on port %d", 10000)
    });
    
