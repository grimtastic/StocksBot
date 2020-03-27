const stocks2image = require('../modules/stocks-to-image');

const { Page } = require('puppeteer/lib/Page');
Page.prototype.screenshot = jest.fn(async ()=>{});

test('works properly', ()=>{
    return stocks2image.produceImage([], {}, 'stocks.html', 'testing.png')
    .then(()=>{
        expect(Page.prototype.screenshot.mock.calls.length).toBe(1);
        expect(Page.prototype.screenshot).toBeCalledWith({path:'testing.png'});
    })
    .catch(err=>{
        throw err;
    });
});