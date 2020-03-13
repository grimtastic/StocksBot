const { getStocksAndChannels, createEmbedData } = require('../modules/helper-functions');

/* getStocksAndChannels Tests */

/** @type { SettingsDef } */
const SETTINGS = {
    stocks:{
        "msft":"Microsoft",
        "ntdoy":"Nintendo"
    },
    discord_channels:[
        "a",
        {
            id:"b"
        },
        {
            id:"c",
            stocks:{"sony":"Sony"}
        },
        {
            id:"d",
            ignore_default:true,
            stocks:{"sony":"Sony Inc."}
        },
        {
            id:["e","f"],
            ignore_default:true,
            stocks:{"sony":"Sony Inc.","test":"test2"}
        }
    ],
    message_config:{}
};

describe('getStocksAndChannels tests', ()=>{
    test('stocks', ()=>{
        const { stocks, channels } = getStocksAndChannels(SETTINGS.stocks, SETTINGS.discord_channels);

        expect(stocks.length).toBe(4);
        expect(stocks).toContain('msft');
        expect(stocks).toContain('ntdoy');
        expect(stocks).toContain('sony');
        expect(stocks).toContain('test');
    })

    test('channels', ()=>{
        const { channels } = getStocksAndChannels(SETTINGS.stocks, SETTINGS.discord_channels);

        expect(channels.length).toBe(6);

        let a = channels.find(c=>c.id === 'a');
        expect(a).not.toBeUndefined();
        expect(a).toMatchObject({id:'a',stocks:{}});

        let b = channels.find(c=>c.id === 'b');
        expect(b).not.toBeUndefined();
        expect(b).toMatchObject({id:'b',stocks:{}});

        let c = channels.find(c=>c.id === 'c');
        expect(c).not.toBeUndefined();
        expect(c).toMatchObject({id:'c',stocks:{sony:'Sony'}});

        let d = channels.find(c=>c.id === 'd');
        expect(d).not.toBeUndefined();
        expect(d).toMatchObject({id:'d',stocks:{sony:'Sony Inc.'},ignore_default:true});

        let e = channels.find(c=>c.id === 'e');
        expect(e).not.toBeUndefined();
        expect(e).toMatchObject({id:'e',stocks:{sony:'Sony Inc.',test:'test2'},ignore_default:true});

        let f = channels.find(c=>c.id === 'f');
        expect(f).not.toBeUndefined();
        expect(f).toMatchObject({id:'f',stocks:{sony:'Sony Inc.',test:'test2'},ignore_default:true});
    })
})

/* createEmbedData tests */

/** @type { Stock[] } */
const STOCKS_DATA = [
    {symbol:'msft',price:1,change:1,changePercent:'1%'},
    {symbol:'ntdoy',price:2,change:2,changePercent:'2%'},
    {symbol:'sony',price:-1,change:-1,changePercent:'-1%'}
];

describe('createEmbedData tests', ()=>{
    test('default data', ()=>{
        const data = createEmbedData(STOCKS_DATA, SETTINGS);
        expect(data.fields.length).toBe(2);
        expect(data.fields).toContainEqual({title:'Microsoft',value:'1 (1%)'});
        expect(data.fields).toContainEqual({title:'Nintendo',value:'2 (2%)'});
    })

    test('string channel data', ()=>{
        const { channels } = getStocksAndChannels(SETTINGS.stocks, SETTINGS.discord_channels);
        const data = createEmbedData(STOCKS_DATA, SETTINGS, channels[0]);
        expect(data.fields.length).toBe(2);
        expect(data.fields).toContainEqual({title:'Microsoft',value:'1 (1%)'});
        expect(data.fields).toContainEqual({title:'Nintendo',value:'2 (2%)'});
    })

    test('object channel data', ()=>{
        const { channels } = getStocksAndChannels(SETTINGS.stocks, SETTINGS.discord_channels);
        const data = createEmbedData(STOCKS_DATA, SETTINGS, channels[1]);
        expect(data.fields.length).toBe(2);
        expect(data.fields).toContainEqual({title:'Microsoft',value:'1 (1%)'});
        expect(data.fields).toContainEqual({title:'Nintendo',value:'2 (2%)'});
    })

    test('object channel data', ()=>{
        const { channels } = getStocksAndChannels(SETTINGS.stocks, SETTINGS.discord_channels);
        const data = createEmbedData(STOCKS_DATA, SETTINGS, channels[2]);
        expect(data.fields.length).toBe(3);
        expect(data.fields).toContainEqual({title:'Microsoft',value:'1 (1%)'});
        expect(data.fields).toContainEqual({title:'Nintendo',value:'2 (2%)'});
        expect(data.fields).toContainEqual({title:'Sony',value:'-1 (-1%)'});
    })

    test('object channel data', ()=>{
        const { channels } = getStocksAndChannels(SETTINGS.stocks, SETTINGS.discord_channels);
        const data = createEmbedData(STOCKS_DATA, SETTINGS, channels[3]);
        expect(data.fields.length).toBe(1);
        expect(data.fields).toContainEqual({title:'Sony Inc.',value:'-1 (-1%)'});
    })
})