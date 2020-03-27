const path = require('path');
const stocks2image = require('./modules/stocks-to-image');

// load settings
try {
    var settings = require('./modules/settings').load(path.join(__dirname, 'config.json'));
} catch (err) {
    console.error(`Error loading settings: ${err}`);
    process.exit(1);
}

// perform work
(async function() {
    // get stocks to test
    let stocks = Object.assign({}, settings.stocks);
    if (Object.keys(stocks).length === 0) {
        console.warn('No stocks in settings.');
        return;
    }

    /** 
     * Fake stock data
     * @type { Stock[] } 
     */
    let stocksData = Object.keys(stocks).map((stock,i)=>({
        symbol:stock,
        change:(Math.random() * (i % 2 ? 100 : -100)).toFixed(2),
        changePercent:(Math.random() * (i % 2 ? 10 : -10)).toFixed(4),
        price:(Math.random() * 1000).toFixed(4)
    }));

    // produce image
    await stocks2image.produceImage(stocksData, stocks, 'template.html', 'test-image.png');
})();