const fs = require('fs');
const path = require('path');
const DiscordHandler = require('./modules/discord-handler');

const { getStocksAndChannels, createEmbedData } = require('./modules/helper-functions');

// load config
try {
    /** @type { SettingsDef } */
    var settings = require('./modules/settings').load(path.join(__dirname, 'config.json'));
} catch (err) {
    console.error(`Error loading settings: ${err}`);
    process.exit(1);
}

const stocks2image = require('./modules/stocks-to-image');

// set up stocks getter module
const StocksGetter = require('./modules/stocks-getter')(settings.alpha_vantage_api_key, settings.api_limit);

// run bot
(async function() {
    // check if we are in debug mode
    const isDebug = process.argv.includes('-debug');

    if (isDebug) {
        console.log('Ready');
    }

    // log into Discord
    try {
        var discord = await DiscordHandler(settings.discord_api_key);
    } catch (err) {
        return console.error(`Error connecting to Discord: ${err}`);        
    }

    // get full list of stocks, and each channel with the stocks it's requesting
    const {stocks,channels} = getStocksAndChannels(settings.stocks, !settings.isTestMode ? settings.discord_channels : settings.test_channels, settings.use_image);

    // get stocks data
    try {
        var stocksData = await StocksGetter.get(stocks);
    } catch (err) {
        console.error(`Error getting stocks data: ${err}`);
        if (settings.alert_if_error) {
            try {
                await discord.sendMessage('An error occurred.');
            } catch (err) {
                console.error(`Error dispatching error message: ${err}`);
            }
        }
    }

    // send stocks data
    if (stocksData) {
        if (stocksData.length > 0) {
            let embeds = false, images = false;

            // determine if embed and/or image is necessary
            for (let i = 0; i < channels.length; i++) {
                if (channels[i].use_image) {
                    images = true;
                } else {
                    embeds = true;
                }
            }

            // create default embed if needed
            if (embeds) {
                var defaultEmbed = createEmbedData(stocksData, settings);
            }

            // create default image if needed
            if (images) {
                var img = path.join(__dirname, 'temp.png');
                var defaultImg = path.join(__dirname, 'temp-default.png');

                const symbols = Object.keys(settings.stocks);
                const stocks = stocksData.filter(stock=>symbols.includes(stock.symbol));
                await stocks2image.produceImage(stocks, settings.stocks, path.join(__dirname, 'template.html'), defaultImg);
            }

            // send messages to channels
            for (let i = 0; i < channels.length; i++) {
                // if at least one message failed to send
                let error = false;

                let channel = channels[i];

                if (channel.use_image) {
                    if (!channel.ignore_default) {                        
                        if (Object.keys(channel.stocks).length === 0) {
                            try {
                                // using default stocks, so use default image
                                await discord.sendImage(channel.id, defaultImg);
                            } catch (err) {
                                console.error(err);
                                error = true;
                            }
                            continue;
                        }

                        var names = Object.assign({}, settings.stocks);
                    } else {
                        var names = { };
                    }

                    names = Object.assign(names, channel.stocks);

                    let keys = Object.keys(names);

                    // gets stocks channel requires
                    let channelStocks = stocksData.filter(stock=>keys.includes(stock.symbol));

                    if (channelStocks.length > 0) {
                        try {
                            // create image
                            await stocks2image.produceImage(channelStocks, names, path.join(__dirname, 'template.html'), img);
                            // send to channel
                            await discord.sendImage(channel.id, img);
                        } catch (err) {
                            error = true;
                            console.error(`Error sending stocks image to channel: ${err}`);
                        }
                    } else {
                        console.warn(`No stocks found for channel ${channel.id}`);
                    }

                    // if there was an error, send message if applicable
                    if (error && settings.alert_if_error) {
                        try {
                            await discord.sendMessage(!settings.isTestMode ? settings.discord_channels : settings.test_channels, 'An error occurred.');
                        } catch (err) {
                            console.error(`Error dispatching error message: ${err}`);
                        }
                    }
                } else {                    
                    // create custom embed message if channel's stocks differ from default
                    // TODO: Consider if it's worth checking if channel's stocks actually differ in value from default
                    if (Object.keys(channel.stocks).length > 0) {
                        var data = createEmbedData(stocksData, settings, channel);
                    } else {
                        var data = defaultEmbed;
                    }

                    try {            
                        // send message
                        await discord.sendEmbedMessage(
                            channel.id,
                            data
                        );
                    } catch (err) {
                        console.error(`Error sending stock data message: ${err}`);
                        error = true;
                    }
                }

                // if there was an error, send message if applicable
                if (error && settings.alert_if_error) {
                    try {
                        await discord.sendMessage(!settings.isTestMode ? settings.discord_channels : settings.test_channels, 'An error occurred.');
                    } catch (err) {
                        console.error(`Error dispatching error message: ${err}`);
                    }
                }
            }

            // delete temporary images
            if (images) {
                if (fs.existsSync(img)) {
                    fs.unlinkSync(img);
                }
                if (fs.existsSync(defaultImg)) {
                    fs.unlinkSync(defaultImg);
                }
            }
        } else {
            console.warn('No stocks data found');
        }
    }

    // finish with Discord
    await discord.disconnect();

    if (isDebug) {
        console.log('Done');
    }
})();