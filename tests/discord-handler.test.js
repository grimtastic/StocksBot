/**
 * DISCORD HANDLER
 * Tests for Discord Handler module.
 */

const Discord = require('discord.js');

// mock discord functions
jest.mock('discord.js');

Discord.TextChannel.prototype.send.mockResolvedValue(undefined);

Discord.Client = class {
    constructor() {
        this.channels = {
            cache:{
                get() {
                    return new Discord.TextChannel(null);
                }
            }
        }
    }

    async login() { }
}

Discord.Client.prototype.destroy = jest.fn();

// module to test
const DiscordHandler = require('../modules/discord-handler');

/* TESTS */

// set up instance to test with
let handler;
beforeAll(async ()=>{
    handler = await DiscordHandler('');
})

describe('sendMessage', ()=>{
    /* SUCCESS */
    test('send 1 - string', ()=>{
        return handler.sendMessage('channel1', 'msg')
        .then(res=>{
            expect(res).toBe(true);
            expect(Discord.TextChannel.prototype.send.mock.calls.length).toBe(1);
        })
        .catch(err=>{throw err;});
    })

    test('send 1 - array', ()=>{
        return handler.sendMessage('channel1', 'msg')
        .then(res=>{
            expect(res).toBe(true);
            expect(Discord.TextChannel.prototype.send.mock.calls.length).toBe(1);
        })
        .catch(err=>{throw err;});
    })

    test('send 2', ()=>{
        return handler.sendMessage([ 'channel1', 'channel2' ], 'msg')
        .then(res=>{
            expect(res).toBe(true);
            expect(Discord.TextChannel.prototype.send.mock.calls.length).toBe(2);
        })
        .catch(err=>{throw err;});
    })

    /* FAILURE */
    test('no channels', ()=>{
        return expect(handler.sendMessage([ ], 'msg'))
        .rejects.toBe('No channels specified');
    })

    test('channels is null', ()=>{
        return expect(handler.sendMessage(null, 'msg'))
        .rejects.toBe('No channels specified');
    })

    test('channels is wrong type', ()=>{
        return expect(handler.sendMessage(1, 'msg'))
        .rejects.toBe('Channels is not string or array');
    })

    test('message is null', ()=>{
        return expect(handler.sendMessage('channel', null))
        .rejects.toBe('No message specified');
    })

    test('message is wrong type', ()=>{
        return expect(handler.sendMessage('channel', 1))
        .rejects.toBe('Message is not a string or MessageEmbed');
    })
});

/** @type { Message } */
const EMBED_DATA = {
    fields:[
        {
            title:'Test',
            value:'123'
        }
    ]
};

/** @type { Message } */
const EMBED_DATA_NO_FIELDS = { };

/** @type { Message } */
const EMBED_DATA_MISTYPE_FIELDS = {
    fields:1
};

describe('sendEmbedMessage', ()=>{
    /* SUCCESS */
    test('send 1 - string', ()=>{
        return handler.sendEmbedMessage('channel1', EMBED_DATA)
        .then(res=>{
            expect(res).toBe(true);
            expect(Discord.TextChannel.prototype.send.mock.calls.length).toBe(1);
        })
        .catch(err=>{throw err;});
    })

    test('send 1 - array', ()=>{
        return handler.sendEmbedMessage([ 'channel1' ], EMBED_DATA)
        .then(res=>{
            expect(res).toBe(true);
            expect(Discord.TextChannel.prototype.send.mock.calls.length).toBe(1);
        })
        .catch(err=>{throw err;});
    })

    test('send 2', ()=>{
        return handler.sendEmbedMessage([ 'channel1', 'channel2' ], EMBED_DATA)
        .then(res=>{
            expect(res).toBe(true);
            expect(Discord.TextChannel.prototype.send.mock.calls.length).toBe(2);
        })
        .catch(err=>{throw err;});
    })

    /* FAILURE */
    test('no channels', ()=>{
        return expect(handler.sendEmbedMessage([ ], EMBED_DATA))
        .rejects.toBe('No channels specified');
    })

    test('channels is null', ()=>{
        return expect(handler.sendEmbedMessage(null, EMBED_DATA))
        .rejects.toBe('No channels specified');
    })

    test('channels is wrong type', ()=>{
        return expect(handler.sendEmbedMessage(1, EMBED_DATA))
        .rejects.toBe('Channels is not string or array');
    })

    test('message uses bad data', ()=>{
        return expect(handler.sendEmbedMessage('channel', EMBED_DATA_NO_FIELDS))
        .rejects.toBe('No data fields specified');
    })

    test('message uses misformed data', ()=>{
        return expect(handler.sendEmbedMessage('channel', EMBED_DATA_MISTYPE_FIELDS))
        .rejects.toBe('Data fields is not an array');
    })

    test('message is null', ()=>{
        return expect(handler.sendEmbedMessage('channel', null))
        .rejects.toBe('No data for embed');
    })

    test('message is wrong type', ()=>{
        return expect(handler.sendEmbedMessage('channel', 1))
        .rejects.toBe('Data for embed is wrong type');
    })
})

describe('sendImage', ()=>{
    /* SUCCESS */
    test('send 1 - string', ()=>{
        return handler.sendImage('channel1', 'image.png')
        .then(res=>{
            expect(res).toBe(true);
            expect(Discord.TextChannel.prototype.send.mock.calls.length).toBe(1);
        })
        .catch(err=>{throw err;});
    })

    test('send 1 - array', ()=>{
        return handler.sendImage([ 'channel1' ], 'image.png')
        .then(res=>{
            expect(res).toBe(true);
            expect(Discord.TextChannel.prototype.send.mock.calls.length).toBe(1);
        })
        .catch(err=>{throw err;});
    })

    test('send 2', ()=>{
        return handler.sendImage([ 'channel1', 'channel2' ], 'image.png')
        .then(res=>{
            expect(res).toBe(true);
            expect(Discord.TextChannel.prototype.send.mock.calls.length).toBe(2);
        })
        .catch(err=>{throw err;});
    })

    /* FAILURE */
    test('no channels', ()=>{
        return expect(handler.sendImage([ ], 'image.png'))
        .rejects.toBe('No channels specified');
    })

    test('channels is null', ()=>{
        return expect(handler.sendImage(null, 'image.png'))
        .rejects.toBe('No channels specified');
    })

    test('channels is wrong type', ()=>{
        return expect(handler.sendImage(1, 'image.png'))
        .rejects.toBe('Channels is not string or array');
    })

    test('image is null', ()=>{
        return expect(handler.sendImage('channel', null))
        .rejects.toBe('No image specified');
    })

    test('image is wrong type', ()=>{
        return expect(handler.sendImage('channel', 1))
        .rejects.toBe('Image is not a string');
    })
})

test('disconnect', ()=>{
    handler.disconnect();
    expect(Discord.Client.prototype.destroy.mock.calls.length).toBe(1);
})