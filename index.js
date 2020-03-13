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
    const {stocks,channels} = getStocksAndChannels(settings.stocks, settings.discord_channels);

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
        // create default message for channels without their custom stockss
        const defaultData = createEmbedData(stocksData, settings);

        // if at least one message failed to send
        let error = false;

        for (let i = 0; i < channels.length; i++) {
            let channel = channels[i];

            // create custom embed message if channel's stocks differ from default
            // TODO: Consider if it's worth checking if channel's stocks actually differ in value from default
            if (Object.keys(channel.stocks).length > 0) {
                var data = createEmbedData(stocksData, settings, channel);
            } else {
                var data = defaultData;
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

    // done so disconnect
    await discord.disconnect();

    if (isDebug) {
        console.log('Done');
    }
})();