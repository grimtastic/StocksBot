/** @type { Settings } */
const settings = require('./settings');
const https = require('https');

/**
 * Fetches data for stock
 * @param {string} stock Stock symbol
 * @returns { Promise<Stock> }
 */
function fetchStock(stock) {
    return new Promise((resolve, reject)=>{
        if (settings.print_activity) {
            console.log(`Fetching stock: ${stock}`);
        }

        https.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stock}&apikey=${settings.alpha_vantage_api_key}`, res=>{
            if (res.statusCode !== 200) {
                reject(`Wrong response from Alpha Vantage: ${res.statusCode}`);
            } else {
                let ret = '';
                res.on('data', data=>ret += data.toString());
                res.on('end', ()=>{
                    // convert returned JSON string to a string object if possible
                    try {
                        var json = JSON.parse(ret);
                    } catch (err) {
                        throw err;
                    }
                    
                    // get actual data object
                    let stockData = json['Global Quote'];

                    // check actual data object exists
                    if (!stockData) {
                        if (json.Note) {
                            return reject(json.Note);
                        } else {
                            return reject("Stock data didn't have Global Quote value");
                        }
                    }

                    // convert fetched object into more useful Stock object
                    resolve({
                        symbol:stockData['01. symbol'],
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
        });
    });    
}

/**
 * Gets the data for an array of stock symbols.
 * @param {string[]} stocks
 * @return { Stock[] }
 */
async function fetchStockData(stocks) {
    let data = await Promise.all(stocks.map(stock=>fetchStock(stock)));
    return data;
}

/**
 * Gets the latest stocks data. If there are more stocks than are allowed per minute by API then it requests a number of stocks equal
 * to the API limit and repeats this every minute until all stocks have been requested.
 * @returns { Stock[] }
 */
function getStocksData() {
    return new Promise((resolve, reject)=>{
        if (settings.print_activity) {
            console.log('Getting stocks data');
        }

        /** 
         * Stocks to get data for.
         * @type { {[s:string]:string}[] } 
         */
        let stocks = settings.stocks;

        // if number of stocks is no more than API limit, just get data for all stocks and return
        if (Object.keys(stocks).length <= settings.api_limit) {
            fetchStockData(Object.keys(stocks))
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
            let selection = Object.keys(stocks).slice(idx, idx + settings.api_limit);
            idx += settings.api_limit;

            // fetch stock data
            try {
                var ret = await fetchStockData(selection);
            } catch (err) {
                console.error(`Error getting stock data: ${err}`);                
            }

            if (ret) {
                // add stock data to existing set of returned data
                data = data.concat(ret);
            }

            // if all stocks fetched, clear timer and return data
            if (idx >= Object.keys(stocks).length) {
                if (settings.print_activity) {
                    console.log('Successfully fetched all stock data');
                }

                clearInterval(timer);
                resolve(data);
            }
        };

        // get first set of data
        getData();

        // set minute timer for getting data
        timer = setInterval(getData, 60000);
    });
}

module.exports = getStocksData;