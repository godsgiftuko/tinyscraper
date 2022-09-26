const EventEmitter = require('events');
const axios = require('axios');
const cheerio = require('cheerio');
const CONSTANTS = require('../constants');

module.exports = class TinyScraper extends EventEmitter {
    constructor(url, timeout = 2000) {
        super();
        this.url = url;

        if (timeout.constructor === String) {
            if (!parseInt(timeout.match(/\d+/))) {
                this.timeout = 2000;
            }

        }
        this.timeout = timeout;

        this.init()
        .then(() => {})
        .catch((e) => e);
    }

    async init() {
        try {
            let payload;
     
            if (!this.url.trim()) {
                throw {
                    error: 'No url'
                }
            }

            const data = await this.fetchPage();
            if (data) {
                const stringifiedData = await this.parsePage(data);

                if (stringifiedData) {
                    payload = JSON.parse(stringifiedData);
                    this.emit('scrapeSuccess', {
                        message: 'JSON Data received:',
                        data: payload
                    });
                    process.exit();
                }
            }
            
            setTimeout(() => {
                this.emit('timeout', payload ? 'Scraping timed out' : 'Stopping scraper');
                process.exit();
            }, this.timeout);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async fetchPage() {
        try {
            this.emit('scrapeStarted', CONSTANTS.newLine + `Fetching: ${this.url}` + CONSTANTS.newLine );
            const res = (await axios.get(this.url));
            return res.data;
        } catch (e) {
            let error;
            if (e.response.status === CONSTANTS.ErrorCodes.notFound) {
                error = 'The URL is not valid.';
            }
            this.emit('error', {
                error,
            });
            process.exit();
        }
    }

    async parsePage(webpage) {
        try {
            this.emit('scrapeStarted', CONSTANTS.newLine + `Started Scraping data from: ${this.url}`+ CONSTANTS.newLine)
            const data = {};
            const $ = cheerio.load(webpage);
            const metas = $('head > meta').toArray();
            metas.map((meta) => {
                const metaProp = meta.attribs.property;
                if (metaProp !== undefined) {
                    const [, prop] = meta.attribs.property.split(':');
                    const value = meta.attribs.content;
                    data[prop] = value;
                }
            });

            return JSON.stringify(data);
        } catch (error) {
            throw error;
        }
    }
};
