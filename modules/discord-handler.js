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

    // no object
    if (typeof data !== 'object') {
        throw 'Data for embed is wrong type';
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
        // check channels is valid
        if (!channels || (Array.isArray(channels) && channels.length === 0)) {
            return reject('No channels specified');
        }
        if (typeof channels !== 'string' && !Array.isArray(channels)) {
            return reject('Channels is not string or array');
        }

        // check msg is valid
        if (!msg) {
            return reject('No message specified');
        }
        if (typeof msg !== 'string' && typeof msg !== 'object') {
            return reject('Message is not a string or MessageEmbed');
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

        resolve(failures === 0);
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
async function sendEmbedMessage(channels, data) {
    var msg = makeEmbed(data);
    return await dispatchMsg(channels, msg);
}

/**
 * Sends an image to channel(s).
 * @param {string|string[]} channels 
 * @param {string} image 
 */
async function sendImage(channels, image) {
    if (!image) {
        throw 'No image specified';
    }

    if (typeof image !== 'string') {
        throw 'Image is not a string';
    }

    /** @type { Discord.APIMessage } */
    let msg = {
        files:[
            {
                attachment:image,
                name:'Stocks.png'
            }
        ]
    };

    return await dispatchMsg(channels, msg);
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
        sendImage,
        disconnect
    }
};