const settings = require('./settings');
const Discord = require('discord.js');
const StocksGetter = require('./stocks-getter');

const client = new Discord.Client();

if (settings.print_activity) {
    console.log('Started');
}

/**
 * Sends a message to a Discord channel.
 * @param {Discord.TextChannel} channel 
 * @param {Stock[]} stocks
 * @returns { Promise<void> }
 */
function sendMessage(channel, stocks) {
    return new Promise((resolve, reject)=>{
        if (settings.print_activity) {
            console.log('Sending message to Discord channel');
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

        // send message
        channel.send(embed)
        .then(resolve)
        .catch(reject)
    });
}

// Discord client is ready; do work
client.once('ready', async ()=>{
    if (settings.print_activity) {
        console.log('Ready');
    }

    /** @type { Discord.TextChannel } */
    const channel = client.channels.cache.get(settings.discord_channel);

    if (!channel) {
        console.error('Bot may not have access to Discord channel specified in config.');
    } else {
        try {
            var stocksData = await StocksGetter();
        } catch (err) {
            console.error(`Error getting stocks data: ${err}`);
            if (settings.alert_if_error) {
                await channel.send('An error occurred.');
            }
        }

        if (stocksData) {
            try {
                await sendMessage(channel, stocksData);
            } catch(err) {
                console.error(`Error sending message: ${err}`);
                if (settings.alert_if_error) {
                    await channel.send('An error occurred.');
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