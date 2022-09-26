const TinyScraper = require('./scraper');

const [ url, timeout ] = process.argv.slice(2);
const scraper = new TinyScraper(url, timeout);

scraper.on('scrapeSuccess', (data) => {
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
