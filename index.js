const path = require('path');

// load config
try {
    var settings = require('./modules/settings').load(path.join(__dirname, 'config.json'));
} catch (err) {
    console.error(`Error loading settings: ${err}`);
    process.exit(1);
}

// set up stocks getter module
const StocksGetter = require('./modules/stocks-getter')(settings.alpha_vantage_api_key, settings.api_limit);

// load Discord handler module
const DiscordHandler = require('./modules/discord-handler');

// run bot
(async function() {
    const isDebug = process.argv.includes('-debug');

    if (isDebug) {
        console.log('Ready');
    }

    // log into Discord
    try {
        var discord = await DiscordHandler(settings.discord_api_key);
    } catch (err) {
        console.error(`Error connecting to Discord: ${err}`);
        return;
    }

    // get stocks data
    try {
        var stocksData = await StocksGetter.get(Object.keys(settings.stocks));
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

    // send stocks data, if any
    if (stocksData) {
        // construct data for embed
        const data = {
            title:settings.message_config.title,
            color:settings.message_config.color,
            footer:settings.message_config.footer,
            image:settings.message_config.image,
            inline:settings.message_config.inline,
            thumbnail:settings.message_config.thumbnail,
            fields:stocksData.map(sd=>{
                let title = settings.stocks[sd.symbol];
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

        try {            
            // send message
            await discord.sendEmbedMessage(
                !settings.isTestMode ? settings.discord_channels : settings.test_channels, 
                data
            );
        } catch (err) {
            console.error(`Error sending stock data message: ${err}`);
            if (settings.alert_if_error) {
                try {
                    await discord.sendMessage(!settings.isTestMode ? settings.discord_channels : settings.test_channels, 'An error occurred.');
                } catch (err) {
                    console.error(`Error dispatching error message: ${err}`);
                }
            }
        }        
    }

    // done so disconnect
    await discord.disconnect();

    if (isDebug) {
        console.log('Done');
    }
})();