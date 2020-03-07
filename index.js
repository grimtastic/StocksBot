/** @type {Settings} settings */
const settings = require('./settings');
const Discord = require('discord.js');
const StocksGetter = require('./stocks-getter');

const client = new Discord.Client();

// indicate that app has started
if (settings.print_activity) {
    console.log('Started');
}

/**
 * Sends a message to each Discord channel.
 * @param {string|Discord.MessageEmbed} msg 
 */
function dispatchMsg(msg) {
    return new Promise(async (resolve, reject)=>{
        if (settings.print_activity) {
            console.log('Dispatching message to channel(s)');
        }

        // select list of channels based on if its test mode or not
        let channelList = (!settings.isTestMode ? settings.discord_channels : settings.test_channels);

        if (Array.isArray(channelList)) {
            // channel setting is an array; send message to all channels
            /** @type { string[] } channels */
            // send message to each channel
            for (let i = 0; i < channelList.length; i++) {
                /** @type {Discord.TextChannel} channel */            
                let channel = client.channels.cache.get(channelList[i]);
                if (channel) {
                    try {
                        await channel.send(msg);
                    } catch (err) {
                        console.error(`Error sending message to channel ${channelList[i]}: ${err}`);
                    }
                } else {
                    console.error(`Cannot find channel for ID ${channelList[i]}`);
                }
            }
            resolve();
        } else {
            // channel is a string; send to single channel
            let channel = client.channels.cache.get(channelList);
    
            if (channel) {
                // send message
                channel.send(msg)
                .then(resolve)
                .catch(err=>{
                    reject(`Error sending message to channel: ${err}`);                    
                })
            } else {
                reject(`Cannot find channel for ID ${channelList}`);
            }
        }
    });    
}

/**
 * Sends a message to a Discord channel.
 * @param {Discord.TextChannel} channel 
 * @param {Stock[]} stocks
 * @returns { Promise<void> }
 */
function sendStockDataMessage(stocks) {
    return new Promise((resolve, reject)=>{
        if (settings.print_activity) {
            console.log('Making stocks data message');
        }
    
        let embed = new Discord.MessageEmbed();
    
        // apply message settings from config file
        if (settings.message_config) {
            if (settings.message_config.color) {
                embed.setColor(settings.message_config.color);
            }
            if (settings.message_config.title) {
                embed.setTitle(settings.message_config.title);
            }
            if (settings.message_config.thumbnail) {
                embed.setThumbnail(settings.message_config.thumbnail);
            }
            if (settings.message_config.image) {
                embed.setImage(settings.message_config.image);
            }
            if (settings.message_config.footer) {
                embed.setFooter(settings.message_config.footer);
            }
        }
    
        // add stocks to message
        stocks.forEach(stock=>{
            // get name of stock from config; use symbol if cannot find name
            let stockKey = Object.keys(settings.stocks).find(s=>s.toLowerCase() === stock.symbol.toLowerCase());
            if (stockKey) {
                var symbol = settings.stocks[stockKey];
            } else {
                var symbol = stock.symbol;
            }
    
            if (settings.message_config.change_indicators) {
                if (stock.change > 0) {
                    var emoji = ':chart_with_upwards_trend:';
                } else if (stock.change < 0) {
                    var emoji = ':chart_with_downwards_trend:';
                }
            }
    
            let txt = `$${stock.price} (${stock.changePercent})`;
            if (emoji) {
                txt += ` ${emoji}`;
            }
    
            // add to message
            embed.addField(symbol, txt, settings.message_config.inline);
        });
    
        dispatchMsg(embed)
        .then(resolve)
        .catch(reject);
    })    
}

// Discord client is ready; do work
client.once('ready', async ()=>{
    if (settings.print_activity) {
        console.log('Ready');
    }

    // get stocks data
    try {
        var stocksData = await StocksGetter();
    } catch (err) {
        console.error(`Error getting stocks data: ${err}`);
        if (settings.alert_if_error) {
            try {
                await dispatchMsg('An error occurred.');
            } catch (err) {
                console.error(`Error dispatching error message: ${err}`);
            }
        }
    }

    // send stocks data, if any
    if (stocksData) {
        try {
            await sendStockDataMessage(stocksData);            
        } catch (err) {
            if (err) {
                console.error(`Error sending stock data message: ${err}`);
            }
            if (settings.alert_if_error) {
                try {
                    await dispatchMsg('An error occurred.');
                } catch (err) {
                    console.error(`Error dispatching error message: ${err}`);
                }
            }
        }        
    }

    client.destroy();

    if (settings.print_activity) {
        console.log('Done');
    }
});

client.login(settings.discord_api_key);