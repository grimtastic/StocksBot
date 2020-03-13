// data returned by API
interface Stock {
    symbol: string;
    open: number;
    high: number;
    low: number;
    price: number;
    volume: number;
    latestTradingDay: string;
    previousClose: string;
    change: number;
    changePercent: string;
}

// MessageEmbed field
type Field = {
    title: string;
    value: string;
};

// data for MessageEmbed
interface Message {
    fields: Field[];
    title?: string;
    color?: string;
    thumbnail?: string;
    image?: string;
    footer?: string;
    inline?: boolean;
}

// data that represents a channel
interface ChannelDetails {
    // ids of channels to send to
    id: string | string[];
    ignore_default: boolean;
    stocks: string | {[s:string]:string};
}

// settings in config files
interface SettingsDef {
    // api key for Discord
    discord_api_key: string;
    // ID for Discord channel(s) to post in
    discord_channels: string | string[] | ChannelDetails;
    // ID for Discord channel(s) to post in when in test mode
    test_channels: string | string[];
    // API key for Alpha Vantage
    alpha_vantage_api_key: string;
    // stocks to check; object with stock symbol as key and name as value
    stocks: {[s:string]:string}[];
    // API requests per minute (defaults to 5)
    api_limit?: number;
    // if true, sends message to Discord channel on error
    alert_if_error: boolean;
    // if app should print what it is doing
    print_activity: boolean;
    // config for message sent to discord    
    message_config:{
        // title of message, e.g. bot name
        title: string;
        // thumbnail to accompany message
        thumbnail: string;
        // color for side of message
        color: string;
        // if multiple stocks should appear on the same row
        inline: boolean;
        // image to accompany message at the bottom
        image: string;
        // footer text
        footer: string;
        // if emojis should be added to messages to indicate price movement
        change_indicators: boolean;
    },
    isTestMode?:boolean; // if app was launched with -test; set by Settings module
}