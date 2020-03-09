/**
 * DISCORD HANDLER
 * Tests for Discord Handler module.
 * TODO:
 * - Ensure Discord.Client.send() is actually being called the correct amount of times
 * - Figure out how best to handle error messages, which print during tests
 */

const DiscordHelper = require('./helpers/DiscordHelper');

const DiscordHandler = require('../modules/discord-handler');

// tests that rely on failing to log into Discord
describe('Discord - unsuccessful login', ()=>{
    DiscordHelper.failLogin();

    test('Discord - failed login', ()=>{
        return expect(DiscordHandler('')).rejects.toBe('An invalid token was provided.');
    });
})

// tests that rely on successfully logging into Discord
describe('Discord - successful login', ()=>{
    let discord = null;

    beforeAll(()=>{
        DiscordHelper.succeedLogin();
        DiscordHelper.succeedGetChannel();
    });

    /**
     * Connect to Discord.
     */
    test('Discord - successful login', done=>{
        return DiscordHandler('')
        .then(funcs=>{
            discord = funcs;
            expect(funcs).not.toBeUndefined();
            done();
        })
    });
  
    /**
     * Send message to single channel.
     */
    test('Discord - send message', ()=>{
        return expect(discord.sendMessage('a', 'b')).resolves.toBeUndefined();
    });

    /**
     * Send message to multiple channels.
     */
    test('Discord - send message to multiple channels', ()=>{
        return expect(discord.sendMessage([ 'a', 'b' ], 'c')).resolves.toBeUndefined();
    });

    /**
     * Send message without specifying channels.
     */
    test('Discord - send message without channels', ()=>{
        return expect(discord.sendMessage(null, 'a')).rejects.toMatch('No channels specified');
    })

    /**
     * Send message without specifying message.
     */
    test('Discord - send message without message', ()=>{
        return expect(discord.sendMessage('a')).rejects.toMatch('No message specified');
    })

    /**
     * Send embed message.
     */
    test('Discord - send embed message', ()=>{
        let mock_data = {
            fields:[ { title:'a', value:'b' } ]
        };

        return expect(discord.sendEmbedMessage('a', mock_data)).resolves.toBeUndefined();
    });

    /**
     * Send embed message without specifying channels.
     */
    test('Discord - sending embed message without channels', ()=>{
        let mock_data = { 
            fields:[ { title:'a', value:'b' } ] 
        };

        return expect(discord.sendEmbedMessage(null, mock_data)).rejects.toMatch('No channels specified');
    })

    /**
     * Send embed message without specifying message.
     */
    test('Discord - sending embed message without message', ()=>{
        expect(()=>discord.sendEmbedMessage('a')).toThrowError('No data for embed');
    })

    /**
     * Send embed message with bad data.
     */
    test('Discord - sending embed message with incorrect data', ()=>{
        expect(()=>discord.sendEmbedMessage('a', {})).toThrow('No data fields specified');
    });

    /**
     * Send embed message with no fields.
     */
    test('Discord - sending embed message with no fields', ()=>{
        expect(()=>discord.sendEmbedMessage('a', {fields:[]})).toThrow('No data fields specified');
    });

    /**
     * Send embed message with invalid fields.
     */
    test('Discord - sending embed message with incorrect fields type', ()=>{
        expect(()=>discord.sendEmbedMessage('a', {fields:'a'})).toThrow('Data fields is not an array');
    });

    /**
     * Send embed message with invalid channel.
     */
    test('Discord - sending message with incorrect channel', ()=>{
        DiscordHelper.failGetChannel();
        return expect(discord.sendMessage('a', 'test')).rejects.toMatch('Failed to send to all channels');
    });

    /**
     * Fail to send message.
     */
    test('Discord - sending message with failure', ()=>{
        DiscordHelper.failSendMessage();
        return expect(discord.sendMessage('a', 'test')).rejects.toMatch('Failed to send to all channels');
    });

    /**
     * Fail to send embed message.
     */
    test('Discord - sending embed message with failure', ()=>{
        let mock_data = { 
            fields:[ { title:'a', value:'b' } ] 
        };
        DiscordHelper.failSendMessage();
        return expect(discord.sendEmbedMessage('a', mock_data)).rejects.toMatch('Failed to send to all channels');
    });

    /**
     * Disconnect from Discord.
     */
    test('Discord - disconnect', ()=>{
        expect(discord).not.toBeFalsy();
        expect(discord.disconnect()).toBeUndefined();
    });
})