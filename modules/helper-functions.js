/**
 * HELPER FUNCTIONS
 * Provides miscellaneous functions to help other modules.
 */

const https = require('https');

/**
 * Fetches JSON from a URL.
 * TODO: Figure out how to test this function, i.e. mock https.get.
 * @param { string } url URL of JSON
 * @returns { Object } JSON object
 */
function getJSON(url) {
    return new Promise((resolve, reject)=>{
        let req = https.get(url, res=>{
            if (res.statusCode !== 200) {
                reject(`Wrong response from Alpha Vantage: ${res.statusCode}`);
            } else {
                // json object in response
                let ret = '';
                res.on('data', data=>ret += data.toString());

                res.on('end', ()=>{
                    // if no data, return nothing
                    if (ret.length === 0) {
                        return resolve(null);
                    }

                    // convert returned JSON string to a string object if possible
                    try {
                        var json = JSON.parse(ret);
                    } catch (err) {
                        throw err;
                    }
                    
                    resolve(json);
                });

                res.on('error', err=>reject(err));
            }
        });

        req.on('error', err=>reject(err));
    });
}

/**
 * Gets all stocks to retrieve and which stocks to send to which channels.
 * @param {{[s:string]:string}} stocks 
 * @param {string | string[] | ChannelDetails} discordChannels
 * @returns {{stocks:string[],channels:ChannelDetails[]}}
 */
function getStocksAndChannels(stocks, discordChannels, useImage = false) {
    // get channels and stocks
    let stocksList = Object.keys(stocks);
    let channels = [ ];

    // add channels that only have default stocks
    if (typeof discordChannels === 'string') {
        channels.push({
            id:discordChannels,
            stocks:{}
        });
    } else {
        // find each channel with its own stocks and add them
        discordChannels.forEach(dc=>{
            if (typeof dc === 'object') {
                /** @type { ChannelDetails[] } */
                let newChannels = [ ];

                if (Array.isArray(dc.id)) {
                    dc.id.forEach(c=>{
                        newChannels.push({
                            id:c,
                            ignore_default:dc.ignore_default || false,
                            stocks:{},
                            use_image:typeof dc.use_image !== 'undefined' ? dc.use_image : useImage
                        });
                    });
                } else {
                    newChannels.push({
                        id:dc.id,
                        ignore_default:dc.ignore_default || false,
                        stocks:{},
                        use_image:typeof dc.use_image !== 'undefined' ? dc.use_image : useImage
                    });
                }
                
                if (dc.stocks) {
                    newChannels.forEach(c=>{
                        c.stocks = Object.assign({}, dc.stocks);
                    });
                    Object.keys(dc.stocks).forEach(k=>{
                        if (!stocksList.includes(k)) {
                            stocksList.push(k);
                        }
                    })
                }

                channels.push.apply(channels, newChannels);
            } else {
                channels.push({
                    id:dc,
                    stocks:{},
                    use_image:useImage
                });
            }
        });
    }

    return { stocks:stocksList, channels };
}

/**
 * Turns stocks data into an embed for channels.
 * @param { Stock[] } stocksData
 * @param { SettingsDef } settings
 * @param { {id:string,ignore_default?:boolean,stocks:{[s:string]:string}} } channel
 * @returns { Message }
 */
function createEmbedData(stocksData, settings = { message_config: {}, stocks:{} }, channel = null) {
    let data = {
        title:settings.message_config.title,
        color:settings.message_config.color,
        footer:settings.message_config.footer,
        image:settings.message_config.image,
        inline:settings.message_config.inline,
        thumbnail:settings.message_config.thumbnail,
        fields:stocksData
            .filter(sd=>{
                if (channel && channel.stocks && Object.keys(channel.stocks).includes(sd.symbol)) {
                    return true;
                } else if (settings.stocks && Object.keys(settings.stocks).includes(sd.symbol) && (!channel || !channel.ignore_default)) {
                    return true;
                }
                return false;
            })
            .map(sd=>{
                if (channel && channel.stocks[sd.symbol]) {
                    var title = channel.stocks[sd.symbol];
                } else {
                    var title = settings.stocks[sd.symbol];
                }
                let value = `${sd.price} (${sd.changePercent})`;

                if (settings.message_config.change_indicators) {
                    if (sd.change > 0) {
                        value += ':chart_with_upwards_trend:';
                    } else if (sd.change < 0) {
                        value += ':chart_with_downwards_trend:';
                    }
                }

                return { title, value };
            })
    };

    return data;
}

module.exports = {
    getJSON, getStocksAndChannels, createEmbedData
};