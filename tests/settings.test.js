/**
 * SETTINGS
 * Tests for Settings module.
 */

let Settings = require('../modules/settings');

// valid test data
const mock_goodData = {
    alpha_vantage_api_key:'1',
    discord_api_key:'1',
    discord_channels:[''],
    stocks:{'1':'2'}        
};

// invalid test data
const mock_badData = { };

// return appropriate data based on request when loading config file
jest.mock('good.json', ()=>Object.assign({}, mock_goodData), {virtual:true});    
jest.mock('bad.json', ()=>Object.assign({}, mock_badData), {virtual:true});

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