# StocksBot
Simple Discord bot for retrieving stocks data from the Alpha Vantage API.

Requires Node.js.

To install: npm install

To run: npm start

## Config File
The bot requires a config file named *config.json*.

**Required fields**
- discord_api_key: Your Discord bot API key.
- discord_channel: Channel ID for bot to post in.
- alpha_vantage_api_key: API key for Alpha Vantage.
- stocks: An object with stock symbols as the keys and stock names as the values.

**Optional fields**
- message_config: An object with settings for the final message sent to the Discord channel. Each setting is optional.
  - title: Title for the message.
  - thumbnail: URL to thumbnail for message.
  - color: Color for message. (Stop to the left of the message.)
  - inline: If multiple stocks should appear on the same row.
  - image: URL to image to place at bottom of message.
  - footer: Footer text for message.
- alert_if_error: If a message should be sent to Discord in the event of the bot failing.
- print_activity: If the bot should print what it is doing.
