const EventEmitter = require('events');
const axios = require('axios');
const cheerio = require('cheerio');
const CONSTANTS = require('../constants');

module.exports = class TinyScraper extends EventEmitter {
    constructor(url, timeout = 2000) {
        super();
        this.url = url;
        this.timeout = timeout;
        
        this.init()
        .then((data) => {})
        .catch((e) => e);
    }

    async init() {
        try {
            let payload;
            
            const data = await this.fetchPage();
            if (data) {
                payload = await this.parsePage(data);
            }

            setTimeout(() => {
                if (payload) {
                    payload = JSON.parse(payload);
                    this.emit('scrapeSuccess', {
                        message: 'JSON Data received:',
                        data: payload
                    });
                }
                this.emit('timeout', payload ? 'Scraping timed out' : 'Stopping scraper');
                process.exit();
            }, this.timeout);
        } catch (error) {
            throw error;
        }
    }

    async fetchPage() {
        try {
            const res = (await axios.get(this.url));
            return res.data;
        } catch (error) {
            let message;
            if (error.response.status === CONSTANTS.ErrorCodes.notFound) {
                message = 'The URL is not valid.';
            }
            this.emit('error', {
                message,
            });
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
