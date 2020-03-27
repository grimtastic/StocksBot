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
        APIHelper.useBadResponse('a');
        return expect(StocksGetter.get('a')).resolves.toMatchObject([]);
    })

    /**
     * Test if API returns bad status code.
     */
    test('StocksGetter: Bad status', ()=>{
        APIHelper.useBadStatus('a');
        return expect(StocksGetter.get('a')).resolves.toMatchObject([]);
    })

    /**
     * Test if API returns "over limit" error.
     */
    test('StocksGetter: Over API limit', ()=>{
        APIHelper.useAPILimitExceeded('a');
        return expect(StocksGetter.get('a')).resolves.toMatchObject([]);
    })

    /**
     * Test if invalid call to API, e.g. invalid stock.
     */
    test('StocksGetter: Invalid call', ()=>{
        APIHelper.useInvalidCall('a');
        return expect(StocksGetter.get('a')).resolves.toMatchObject([]);
    })

    /**
     * Test if invalid key sent to API.
     */
    test('StocksGetter: Invalid key', ()=>{
        APIHelper.useInvalidAPIKey('a');
        return expect(StocksGetter.get('a')).resolves.toMatchObject([]);
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