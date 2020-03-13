/**
 * SETTINGS
 * Tests for Settings module.
 * TODO:
 * - Several tests mock JSON files. Is there a better way to do this? (jest.mock for JSON files doesn't seem to change the result
 *      after the first call.)
 */

let Settings = require('../modules/settings');

// valid test data
const mock_goodData = {
    alpha_vantage_api_key:'1',
    discord_api_key:'1',
    discord_channels:['a'],
    stocks:{'1':'2'}
};

// invalid test data
const mock_badData = { };

// return appropriate data based on request when loading config file
jest.mock('good.json', ()=>Object.assign({}, mock_goodData), {virtual:true});    
jest.mock('bad.json', ()=>Object.assign({}, mock_badData), {virtual:true});
jest.mock('other.json', ()=>null, {virtual:true});

/**
 * Good data loaded.
 */
test('good data', ()=>{    
    expect(Settings.load('good.json')).toMatchObject(Object.assign({isTestMode:false,api_limit:5}, mock_goodData));
});

/**
 * Bad data loaded.
 */
test('bad data', ()=>{
    expect(()=>Settings.load('bad.json')).toThrow();
});

/**
 * No data loaded.
 */
test('no data', ()=>{
    expect(()=>Settings.load('other.json')).toThrow();
});

/**
 * No channels or stocks provided.
 */
test('no channels or stocks', ()=>{
    let mockData = Object.assign({}, mock_goodData,
        {
            discord_channels:[],
            stocks:{}
        }
    );
    jest.mock('1', ()=>mockData, {virtual:true});
    expect(()=>Settings.load('1')).toThrow('Stocks list is empty');
})

/**
 * No stocks provided and channels don't provide their own.
 */
test('no stocks', ()=>{
    let mockData = Object.assign({}, mock_goodData);

    delete mockData.stocks;

    jest.mock('2', ()=>mockData, {virtual:true});
    expect(()=>Settings.load('2')).toThrow('Channel a has no stocks and stocks list is empty');
})

/**
 * No stocks but channels provide their own.
 */
test('no stocks but channel supplies', ()=>{    
    const mockData = Object.assign({}, mock_goodData,
        {
            stocks:{},
            discord_channels:[
                {
                    id:'a',
                    stocks:{
                        "1":"2"
                    }
                }
            ]
        }
    );
    jest.mock('3', ()=>mockData, {virtual:true});
    expect(Settings.load('3')).toMatchObject(Object.assign({isTestMode:false,api_limit:5}, mockData));
})

/**
 * Stocks and channels both supplied.
 */
test('stocks and channel supplies', ()=>{    
    const mockData = Object.assign({}, mock_goodData,
        {
            discord_channels:[
                {
                    id:'a',
                    stocks:{
                        "1":"2"
                    }
                }
            ]
        }
    );
    jest.mock('4', ()=>mockData, {virtual:true});
    expect(Settings.load('4')).toMatchObject(Object.assign({isTestMode:false,api_limit:5}, mockData));
})