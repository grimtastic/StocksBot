/**
 * STOCKS GETTER
 * Module for retrieving data from Alpha Vantage API.
 */

const Helper = require('./helper-functions');

/**
 * Fetches data for stock
 * @param {string} stock Stock symbol
 * @returns { Promise<Stock> }
 */
function fetchStock(apiKey, stock) {
    return new Promise(async (resolve, reject)=>{
        if (process.argv.includes('-debug')) {
            console.log(`Fetching stock: ${stock}`);
        }

        try {
            var data = await Helper.getJSON(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stock}&apikey=${apiKey}`);
        } catch (err) {
            reject(err);
        }
        
        // get actual data object
        if (data) {
            var stockData = data['Global Quote'];
        }

        // check actual data object exists
        if (!stockData) {
            if (!data) {
                return reject('No data returned from API');
            } else if (data["Error Message"]) {
                return reject(data["Error Message"]);
            }
            if (data.Note) {
                return reject(data.Note);
            } else {
                return reject("Stock data didn't have Global Quote value");
            }
        }

        // convert fetched object into more useful Stock object
        resolve({
            symbol:stock,
            open:parseFloat(stockData['02. open']),
            high:parseFloat(stockData['03. high']),
            low:parseFloat(stockData['04. low']),
            price:parseFloat(stockData['05. price']),
            volume:+stockData['06. volume'],
            latestTradingDay:stockData['07. latestTradingDay'],
            previousClose:stockData['08. previous close'],
            change:parseFloat(stockData['09. change']),
            changePercent:stockData['10. change percent']
        });
    });    
}

/**
 * Gets the data for an array of stock symbols.
 * @param {string[]} stocks
 * @return { Stock[] }
 */
async function fetchStockData(apiKey, stocks) {
    return await Promise.all(stocks.map(stock=>fetchStock(apiKey, stock)));
}

/**
 * Gets the latest stocks data. If there are more stocks than are allowed per minute by API then it requests a number of stocks equal
 * to the API limit and repeats this every minute until all stocks have been requested.
 * @param { string } apiKey Alpha Vantage API key
 * @param { string|string[] } stocks Stock symbols
 * @returns { Stock[] }
 */
function getStocksData(apiKey, stocks, apiLimit = 5, waitTime = 60000) {
    return new Promise((resolve, reject)=>{
        let isDebug = process.argv.includes('-debug');

        if (isDebug) {
            console.log('Getting stocks data');
        }

        // convert stocks to array if not one
        if (typeof stocks === 'string') {
            stocks = [ stocks ];
        }

        // if number of stocks is no more than API limit, just get data for all stocks and return
        if (stocks.length <= apiLimit) {
            fetchStockData(apiKey, stocks)
            .then(resolve)
            .catch(reject);
            return;
        }

        /** 
         * Stock data to return.
         * @type { Stock[] } 
         */
        let data = [ ];

        // start of next subarray of stocks to get
        let idx = 0;
        // minute timer to get more stock data
        let timer = null;

        // function to get stock data and return results if all data has been gotten
        let getData = async ()=>{            
            // get next selection of stocks
            let selection = stocks.slice(idx, idx + apiLimit);
            idx += apiLimit;

            // fetch stock data
            try {
                var ret = await fetchStockData(apiKey, selection);
            } catch (err) {
                console.error(`Error getting stock data: ${err}`);                
            }

            if (ret) {
                // add stock data to existing set of returned data
                data.push.apply(data, ret);
            }

            // if all stocks fetched, clear timer and return data
            if (idx >= stocks.length) {
                if (isDebug) {
                    console.log('Successfully fetched all stock data');
                }

                clearInterval(timer);
                resolve(data);
            }
        };

        // get first set of data
        getData();

        // set minute timer for getting data
        timer = setInterval(getData, waitTime);
    });
}

module.exports = (apiKey, apiLimit, waitTime)=>({
    get:(stocks)=>getStocksData(apiKey, stocks, apiLimit, waitTime)
});