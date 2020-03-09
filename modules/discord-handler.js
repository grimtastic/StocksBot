/**
 * DISCORD HANDLER
 * Module that provides functions for sending messages to Discord.
 */

const Discord = require('discord.js');

const client = new Discord.Client();

/**
 * Turns a Message into a MessageEmbed
 * @param { Message } data Message data to turn into embed
 * @returns { Discord.MessageEmbed }
 */
function makeEmbed(data) {
    // no data
    if (!data) {
        throw 'No data for embed';
    }

    // check required data
    if (!data.fields || data.fields.length === 0) {
        throw 'No data fields specified';
    }

    if (!Array.isArray(data.fields)) {
        throw 'Data fields is not an array';
    }

    // embed to return
    let embed = new Discord.MessageEmbed();

    // apply message settings from config file    
    if (data.color) {
        embed.setColor(data.color);
    }
    if (data.title) {
        embed.setTitle(data.title);
    }
    if (data.thumbnail) {
        embed.setThumbnail(data.thumbnail);
    }
    if (data.image) {
        embed.setImage(data.image);
    }
    if (data.footer) {
        embed.setFooter(data.footer);
    }

    // add stocks to message
    data.fields.forEach(field=>{
        // add to message
        embed.addField(field.title, field.value, data.inline || false);
    });

    return embed;
}

/**
 * Sends a message to each Discord channel.
 * @param { string|string[] } channels Channels to send message to
 * @param { string|Discord.MessageEmbed } msg Message to send
 * @return { Promise<void> }
 */
function dispatchMsg(channels, msg) {
    return new Promise(async (resolve, reject)=>{
        if (!channels) {
            return reject('No channels specified');
        }
        if (!msg) {
            return reject('No message specified');
        }

        // turn string into list if necessary to make things easier
        if (typeof channels === 'string') {
            channels = [ channels ];
        }
        
        let failures = 0;

        // send message to each channel
        for (let i = 0; i < channels.length; i++) {
            /** @type {Discord.TextChannel} channel */            
            let channel = client.channels.cache.get(channels[i]);
            if (channel) {
                try {
                    await channel.send(msg);
                } catch (err) {
                    console.error(`Error sending message to channel ${channels[i]}: ${err}`);
                    failures++;
                }
            } else {
                console.error(`Cannot find channel for ID ${channels[i]}`);
                failures++;
            }
        }

        if (failures < channels.length) {
            resolve();
        } else {
            reject('Failed to send to all channels');
        }
    });    
}

/**
 * Sends a message to channel(s).
 * @param {string|string[]} channels ID of channel(s) to sent to
 * @param {string} message Message to send
 * @returns { Promise<void> }
 */
function sendMessage(channels, message) {
    return dispatchMsg(channels, message);
}

/**
 * Sends an embed to channels, made from specified data.
 * @param { string|string[] } channels 
 * @param { Message } data 
 * @returns { Promise<void> }
 */
function sendEmbedMessage(channels, data) {    
    var msg = makeEmbed(data);
    return dispatchMsg(channels, msg);
}

/**
 * Disconnects from Discord.
 */
function disconnect() {
    client.destroy();
}

module.exports = async (apiKey)=>{
    await client.login(apiKey);

    return {
        sendMessage,
        sendEmbedMessage,
        disconnect
    }
};