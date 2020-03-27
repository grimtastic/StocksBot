/**
 * API HELPER
 * Provides functions to help with tests involving calls to the Alpha Vantage API.
 */

const Helper = require('../../modules/helper-functions');

jest.mock('../../modules/helper-functions');

// possible error messages from API
const RESPONSE_API_EXCEEDED = 'Thank you for using Alpha Vantage! Our standard API call frequency is 5 calls per minute and 500 calls per day. Please visit https://www.alphavantage.co/premium/ if you would like to target a higher API call frequency.';
const RESPONSE_INVALID_CALL = 'Invalid API call. Please retry or visit the documentation (https://www.alphavantage.co/documentation/) for GLOBAL_QUOTE.';
const RESPONSE_INVALID_KEY = 'the parameter apikey is invalid or missing. Please claim your free API key on (https://www.alphavantage.co/support/#api-key). It should take less than 20 seconds, and is free permanently.';

// possible error responses from API
const mock_apiLimitExceeded = { Note: RESPONSE_API_EXCEEDED };
const mock_invalidCall = { "Error Message": RESPONSE_INVALID_CALL };
const mock_invalidKey = { 'Error Message': RESPONSE_INVALID_KEY }

/**
 * Forces API calls to return bad data (null).
 */
function useBadResponse(symbol) {
    Helper.getJSON.mockResolvedValue({
        symbol,
        error:true,
        stock:null
    });
}

/**
 * Forces API calls to simulate bad status (404).
 */
function useBadStatus(symbol) {
    Helper.getJSON.mockResolvedValue({
        symbol,
        error:true,
        stock:null
    });
}

/**
 * Forces API calls to simulate API limit exceeded.
 */
function useAPILimitExceeded(symbol) {
    Helper.getJSON.mockResolvedValue({
        symbol,
        error:true,
        stock:null
    });
}

/**
 * Forces API calls to simulate invalid call (unknown stock).
 */
function useInvalidCall(symbol) {
    Helper.getJSON.mockResolvedValue({
        symbol,
        error:true,
        stock:null
    });
}

/**
 * Forces API calls to simulate invalid key.
 */
function useInvalidAPIKey(symbol) {
    Helper.getJSON.mockResolvedValue({
        symbol,
        error:true,
        stock:null
    });
}

/**
 * Forces API calls to simulate valid data.
 * @param {string} stock 
 */
function useValidData(stock) {
    let stockData = {
        '01. symbol':stock,
        '02. open':0,
        '03. high':0,
        '04. low':0,
        '05. price':0,
        '06. volume':0,
        '07. latestTradingDay':'',
        '08. previous close':'',
        '09. change':0,
        '10. change percent':'0%'
    }

    let mock_goodData = {
        'Global Quote':stockData
    }

    Helper.getJSON.mockResolvedValue(mock_goodData);
}

module.exports = {
    RESPONSE_API_EXCEEDED,
    RESPONSE_INVALID_CALL,
    RESPONSE_INVALID_KEY,

    useBadResponse,
    useBadStatus,
    useAPILimitExceeded,
    useInvalidAPIKey,
    useInvalidCall,
    useValidData
};