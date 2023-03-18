const PORT = process.env.PORT || 5000;

/*let PORT = process.env.PORT;
if (PORT == null || PORT === '') {
    PORT = 5000;
}*/
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
        name: 'aintelligence',
        url: 'https://www.artificialintelligence-news.com/', base: ''
    },
    {
        name: 'medium',
        url: 'https://medium.com/tag/artificial-intelligence/latest',
        base: 'https://medium.com'
    },
    {
        name: 'wired',
        url: 'https://www.wired.com/',
        base: 'https://www.wired.com'
    },
    {
        name: 'techcrunch',
        url: 'https://techcrunch.com/category/artificial-intelligence/',
        base: ''
    },
    {
        name: 'openaiblog',
        url: 'https://openai.com/blog',
        base: 'https://openai.com'
    },
    {
        name: 'nytimes',
        url: 'https://www.nytimes.com/section/technology',
        base: ''
    }
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
    res.send('Welcome to The Artificial Intelligence News API')
});

app.get('/ai-news', async (req, res) => {
    try { // to ensure that all requests have completed before serving the results
        const promises = websites.map(async (site) => {
            const response = await axios.get(site.url);
            const html = response.data;
            const $ = cheerio.load(html);
            $('a:contains("AI")', html).each(function () {
                const title = $(this).text();
                const link = $(this).attr('href');
                articles.push({
                    title,
                    link: site.base + link,
                    source: site.name,
                });
            });
        });
        await Promise.all(promises);
        res.send(articles);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/ai-news/:paperId', (req, res) => {
    const paperId = req.params.paperId;
    const site = websites.find((site) => site.name === paperId);

    if (!site) {
        res.status(404).send(`Website "${paperId}" not found`);
        return;
    }

    const paperAddress = site.url;
    const paperBase = site.base;

    axios
        .get(paperAddress)
        .then((response) => {
            const html = response.data;
            const $ = cheerio.load(html);
            const posts = [];

            $('a:contains("AI")', html).each(function () {
                const title = $(this).text();
                const url = $(this).attr('href');
                posts.push({
                    title,
                    url: paperBase + url,
                    source: paperId,
                });
            });
            res.send(posts);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
});

module.exports = app
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));