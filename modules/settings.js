/**
 * SETTINGS
 * Module for loading and parsing config file.
 */

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
        var err = 'No config file found.';
    } else {
        let missing = [ ];
        let problem = false;

        if (!settings.alpha_vantage_api_key) {
            missing.push('alpha_vantage_api_key');
        }
        if (!settings.discord_api_key) {
            missing.push('discord_api_key');
        }
        if (!settings.discord_channels) {
            missing.push('discord_channels');
        }
        if (!settings.stocks) {
            missing.push('stocks');
        } else if (settings.length === 0) {
            err = `Stocks list is empty`;
            problem = true;
        }

        if (missing.length > 0) {
            if (err) {
                console.error(err);
            }

            err = `Config file is missing keys/values: ${missing.join(', ')}`;
        } else if (!problem) {
            // determine if test mode
            settings.isTestMode = process.argv.includes('-test');
            if (settings.isTestMode && !settings.test_channels) {
                throw 'App is in test mode but test_channels setting is missing in config';
            }

            // set default value for API limit
            settings.api_limit = settings.api_limit || 5;

            return settings;
        }
    }

    throw err;
}

module.exports = {
    load,
    settings
};