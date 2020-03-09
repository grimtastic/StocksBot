/**
 * STOCKS GETTER
 * Tests for Stocks Getter module.
 */

const APIHelper = require('./helpers/APIHelper');

// set up Stocks Getter object
const StocksGetter = require('../modules/stocks-getter')('123', 2, 1000);

/**
 * Generates "good" results for an array of stocks.
 * @param { string|string[] } stocks
 * @returns { Stock[] }
 */
function getGoodResults(stocks) {
    if (!Array.isArray(stocks)) {
        stocks = [ stocks ];
    }

    let results = [ ];

    stocks.forEach(stock=>{
        results.push(
            { "change": 0, "changePercent": '0%', "high": 0, "latestTradingDay": '', "low": 0, "open": 0, "previousClose": '', "price": 0, "symbol": stock, "volume": 0 }
        );
    });

    return results;
}

describe('stock getter - invalid data', ()=>{
    /**
     * Test if API returns no data.
     */
    test('StocksGetter: Bad response', ()=>{
        APIHelper.useBadResponse();
        return expect(StocksGetter.get('a')).rejects.toMatch('No data returned from API');
    })

    /**
     * Test if API returns bad status code.
     */
    test('StocksGetter: Bad status', ()=>{
        APIHelper.useBadStatus();
        return expect(StocksGetter.get('a')).rejects.toMatch("Wrong response from Alpha Vantage: 404");
    })

    /**
     * Test if API returns "over limit" error.
     */
    test('StocksGetter: Over API limit', ()=>{
        APIHelper.useAPILimitExceeded();
        return expect(StocksGetter.get('a')).rejects.toMatch(APIHelper.RESPONSE_API_EXCEEDED);
    })

    /**
     * Test if invalid call to API, e.g. invalid stock.
     */
    test('StocksGetter: Invalid call', ()=>{
        APIHelper.useInvalidCall();
        return expect(StocksGetter.get('a')).rejects.toMatch(APIHelper.RESPONSE_INVALID_CALL);
    })

    /**
     * Test if invalid key sent to API.
     */
    test('StocksGetter: Invalid key', ()=>{
        APIHelper.useInvalidAPIKey();
        return expect(StocksGetter.get('a')).rejects.toMatch(APIHelper.RESPONSE_INVALID_KEY);
    })
})

describe('stock getter - valid data', ()=>{
    beforeAll(()=>APIHelper.useValidData());

    /**
     * Test if string used for stock request.
     */
    test('StocksGetter: Good data for stocks string', ()=>{
        let stocks = 'a';
        const goodResults = getGoodResults(stocks);
        return expect(StocksGetter.get(stocks)).resolves.toMatchObject(goodResults);
    })

    /**
     * Test if array used for stock request.
     */
    test('StocksGetter: Good data for stocks array', ()=>{
        let stocks = [ 'a', 'b' ];
        const goodResults = getGoodResults(stocks);
        return expect(StocksGetter.get(stocks)).resolves.toMatchObject(goodResults);
    })

    /**
     * Test if number of requested stocks is over API rate limit.
     */
    test('StocksGetter: Good data for stocks array over custom limit', ()=>{
        let stocks = [ 'a', 'b', 'c' ];
        const goodResults = getGoodResults(stocks);
        return expect(StocksGetter.get(stocks)).resolves.toMatchObject(goodResults);
    })
})