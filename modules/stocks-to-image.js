const fs = require('fs');
const puppeteer = require('puppeteer');

/**
 * Creates an image that displays the specified stocks.
 * @param {Stock|Stock[]} stocks Stocks to display in image
 * @param {{[s:string]:string}} names Names for each stock symbol
 * @param {string} htmlFile Path to HTML template for image
 * @param {string} output Path to save image to
 * @param {number} maxWidth Approximate max width of image
 */
async function produceImage(stocks, names, htmlFile, output, saveHTMLToFile = false, maxWidth = 3000) {
    if (!Array.isArray(stocks)) {
        stocks = [ stocks ];
    }

    // get HTML template
    let html = fs.readFileSync(htmlFile).toString();

    // create HTML to display stocks
    let text = '<div id="stocks" style="display:grid;grid-template-columns:auto auto auto auto auto">' +
        '<h4 id="symbol">Symbol</h4><h4 id="name">Name</h4><h4 id="price">Price</h4><h4 id="change">Change</h4><h4 id="change-perc">Change %</h4>';

    text += stocks.map(s=>{
        let className = (s.change >= 0) ? 'inc' : 'dec';
        return `<div class="${className} symbol-value">${s.symbol}</div>` +
            `<div class="${className} name-value">${names[s.symbol]}</div>` +
            `<div class="${className} price-value">$${s.price}</div>` +
            `<div class="${className} change-value">${s.change < 0 ?'-':''}$${Math.abs(s.change)}</div>` + 
            `<div class="${className} change-perc-value">${s.changePercent}</div>`;
    }).join('');
    
    // inject HTML into template
    html = html.replace('{stocks}', text);

    try {
        var browser = await puppeteer.launch();
    } catch (err) {
        throw `Error creating browser: ${err}`;
    }

    if (saveHTMLToFile) {
        try {
            fs.writeFileSync('output.html', html);
        } catch (err) {
            console.error(`Error saving HTML to file: ${err}`);
        }
    }

    // save HTML to image
    try {
        const page = await browser.newPage();

        // give elements enough room to fit in without wrapping
        await page.setViewport({
            width:parseInt(maxWidth),
            height:3000,
            deviceScaleFactor:1
        })

        // set content of page to html
        await page.setContent(html);

        // set size of image to fit actual content
        // TODO: The size of the image is slightly increased, because using exact 
        // size can cause word-wrap. Find how to improve this.
        let body = await page.$('body');
        let bb = await body.boundingBox();

        await page.setViewport({
            width:parseInt(bb.width) + 5,
            height:parseInt(bb.height) + 5,
            deviceScaleFactor:1
        })

        // save to image
        await page.screenshot({path: output});

        await browser.close();
    } catch (err) {
        try {
            await browser.close();
        } catch (err) { 
            console.error(`Error closing browser: ${err}`);
        }

        throw err;
    }
    
}

module.exports = { produceImage }