/**
 * SETTINGS
 * Module for loading and parsing config file.
 * TODO: Make sure settings are the correct types.
 */

 /** @type { SettingsDef } */
var settings = { };

/**
 * Loads specified config file.
 * @param { string } path 
 * @returns { SettingsDef }
 */
function load(path) {
    try {
        /** @type { SettingsDef } */
        settings = require(path);
    } catch (err) {
        throw `Error loading config.json: ${err}`;
    }

    /**
     * Check settings to ensure no issues.
     */    
    if (!settings) {
        throw 'No config file found.';
    } else {
        let missing = [ ];

        // check for Alpha Vantage API key
        if (!settings.alpha_vantage_api_key) {
            missing.push('alpha_vantage_api_key');
        }

        // check for Discord API key
        if (!settings.discord_api_key) {
            missing.push('discord_api_key');
        }

        // check for Discord channel(s)
        if (!settings.discord_channels) {
            missing.push('discord_channels');
        } else if (Array.isArray(settings.discord_channels)) {
            let defaultStocks = (settings.stocks && Object.keys(settings.stocks).length > 0);

            settings.discord_channels.forEach((dc, i)=>{
                if (typeof dc === 'object') {
                    /** @type { ChannelDetails } */
                    let details = dc;

                    if (!details.id || (Array.isArray(details.id) && details.id.length === 0)) {
                        throw `Channel of index ${i} does not list an id`;
                    }
                    if (!details.stocks || Object.keys(details.stocks).length === 0) {
                        throw `Channel ${details.id} does not provide any stocks`;
                    } else {
                        let stocks = { };
                        for (let s in details.stocks) {
                            stocks[s.toUpperCase()] = details.stocks[s];
                        }
                        details.stocks = stocks;
                    }
                } else if (!defaultStocks) {
                    throw `Channel ${dc} has no stocks and stocks list is empty`;
                }
            });
        }

        // check for stocks
        if (!settings.stocks) {
            missing.push('stocks');
        } else if (Object.keys(settings.stocks).length === 0) {
            if (typeof settings.discord_channels === 'string' || (Array.isArray(settings.discord_channels) && settings.discord_channels.length === 0)) {
                throw `Stocks list is empty`;
            }
        } else {
            // ensure all stock symbols are uppercase
            let stocks = { };
            for (let key in settings.stocks) {
                let key_uc = key.toUpperCase();
                stocks[key_uc] = settings.stocks[key];
            }
            settings.stocks = stocks;
        }

        if (missing.length > 0) {
            if (err) {
                console.error(err);
            }

            throw `Config file is missing keys/values: ${missing.join(', ')}`;
        } else {
            // determine if test mode
            settings.isTestMode = process.argv.includes('-test');
            if (settings.isTestMode && !settings.test_channels) {
                throw 'App is in test mode but test_channels setting is missing in config';
            }

            // set default value for API limit
            settings.api_limit = settings.api_limit || 5;

            settings.message_config = settings.message_config || { };

            return settings;
        }
    }
}

module.exports = {
    load,
    settings
};