const TinyScraper = require('./scraper');
const scraper = new TinyScraper('https://raw.githubusercontent.com/godsgiftuko/simple-og/main/index.html');

scraper.on('scrapeSuccess', (data) => {
    // const toHashMap = JSON.parse(data);
    console.log(data);
});

scraper.on('scrapeStarted', (data) => {
    console.log(data);
});

scraper.on('error', (e) => {
    console.log(e);
});

scraper.on('timeout', (e) => {
    console.log(e);
});
