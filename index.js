// const PORT = process.env.PORT || 5000;

let PORT = process.env.PORT;
if (PORT == null || PORT == '') {
    PORT = 5000;
}
// app.listen(PORT);
const express = require('express');
const app = express();

const cheerio = require('cheerio');
const axios = require('axios');
const websites = [
    {
        name: "guardian",
        url: "https://www.theguardian.com/technology",
        base: ''
    },
    {
        name:"mitnews",
        url: "https://news.mit.edu/",
        base: ''
    },
    {
        name: 'forbes',
        url: 'https://www.forbes.com/ai/',
        base: ''
    },
    {
        name: 'aintelligence', url: 'https://www.artificialintelligence-news.com/', base: ''
    },
    /*{
        name: 'telegraph',
        address: 'https://www.telegraph.co.uk/artificial-intelligence/',
        base: 'https://www.telegraph.co.uk'
    }*/
    /*{
        name: 'extremetech',
        address: 'https://www.extremetech.com/tag/artificial-intelligence',
        base: ''
    }*/
];
const articles = [];

websites.forEach(element => {
    axios.get(element.url).then((response) => {
        const html = response.data
        const $ = cheerio.load(html)

        $('a:contains("AI")',html).each(function() {
            const title = $(this).text()
            const link = $(this).attr('href')
            articles.push({
                title,
                link: element.base + link,
                source: element.name
            });
        });
    })
})

app.get('/', (req, res) => {
    res.json('Welcome to The Artificial intelligence News API')});

app.get('/ai-news', (req, res) => { //new link
    res.json(articles);
});

app.get('/ai-news/:paperId',(req, res) => {
    const paperId = req.params.paperId;
    //console.log(paperId);

    const paperAddress = websites.filter(element => element.name === paperId)[0].url;
    const paperBase= websites.filter(element => element.name === paperId)[0].base;
    // console.log(paperAddress);

    axios.get(paperAddress)
        .then((response) => {
            const html = response.data;
            const $ = cheerio.load(html);
            const posts = [];

            $('a:contains("AI")',html).each(function() {
                const title = $(this).text()
                const url = $(this).attr('href');
                posts.push({
                    title,
                    url: paperBase + url,
                    source: paperId
                });
            });
            res.json(posts);
        }).catch((err) => console.log(err));
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));