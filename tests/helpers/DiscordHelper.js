/**
 * DISCORD HELPER
 * Provides functions and operations to help with tests involving the Discord module.
 */

const Discord = require('discord.js');

jest.mock('discord.js');

/**
 * Sets Discord module to return requested channel.
 */
function succeedGetChannel() {    
    // TODO: Determine proper way to do this
    Discord.Client.prototype.channels = {
        cache:{
            get:()=>({
                send:async ()=>{ } 
            })
        }
    };
}

/**
 * Sets Discord module to fail to return requested channel.
 */
function failGetChannel() {    
    // TODO: Determine proper way to do this
    Discord.Client.prototype.channels = {
        cache:{
            get:()=>null
        }
    };
}

/**
 * Sets Discord module to fail to send messages.
 */
function failSendMessage() {
    // TODO: Determine proper way to do this
    Discord.Client.prototype.channels = {
        cache:{
            get:()=>({
                send:async ()=>{ throw 'Failed to send message' } 
            })
        }
    };
}

/**
 * Sets Discord module to succeed with login.
 */
function succeedLogin() {
    Discord.Client.prototype.login.mockResolvedValue(undefined);
}

/**
 * Sets Discord module to fail with login.
 */
function failLogin() {
    Discord.Client.prototype.login.mockImplementation(()=>{ throw 'An invalid token was provided.'; });
}

module.exports = {
    succeedLogin,
    failLogin,
    succeedGetChannel,
    failGetChannel,
    failSendMessage
}