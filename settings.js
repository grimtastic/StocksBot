try {
    /** @type { Settings } */
    var settings = require('./config.json');
} catch (err) {
    console.error(`Error loading config.json: ${err}`);
    process.exit(1);
}

/**
 * Check settings to ensure no issues.
 */
(function() {
    if (!settings) {
        console.error('No config file found.');
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
            console.error(`Stocks list is empty`);
        }

        if (missing.length > 0) {
            console.error(`Config file is missing keys/values: ${missing.join(', ')}`);
        } else if (!problem) {
            return;
        }
    }

    process.exit(1);
})();

// set default value for API limit
settings.api_limit = settings.api_limit || 5;

module.exports = settings;