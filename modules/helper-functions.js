/**
 * HELPER FUNCTIONS
 * Provides miscellaneous functions to help other modules.
 */

const https = require('https');

/**
 * Fetches JSON from a URL.
 * TODO: Figure out how to test this function, i.e. mock https.get.
 * @param {string} url URL of JSON
 * @returns { Object } JSON object
 */
function getJSON(url) {
    return new Promise((resolve, reject)=>{
        let req = https.get(url, res=>{
            if (res.statusCode !== 200) {
                reject(`Wrong response from Alpha Vantage: ${res.statusCode}`);
            } else {
                // json object in response
                let ret = '';
                res.on('data', data=>ret += data.toString());

                res.on('end', ()=>{
                    // if no data, return nothing
                    if (ret.length === 0) {
                        return resolve(null);
                    }

                    // convert returned JSON string to a string object if possible
                    try {
                        var json = JSON.parse(ret);
                    } catch (err) {
                        throw err;
                    }
                    
                    resolve(json);
                });

                res.on('error', err=>reject(err));
            }
        });

        req.on('error', err=>reject(err));
    });
}

module.exports = {
    getJSON
};