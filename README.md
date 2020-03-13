# StocksBot
Simple Discord bot for retrieving stocks data from the Alpha Vantage API.

Requires Node.js.

To install: npm install

To run: npm start

To test: npm test

## Config File
The bot requires a config file named *config.json*.

**Required fields**
- discord_api_key: Your Discord bot API key.
- discord_channels: Channel ID or array of channel IDs for bot to post in, or an array of ChannelDetails (see below).
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
  - change_indicators: If emojis should be added to messages to indicate movement of stock.
- alert_if_error: If a message should be sent to Discord in the event of the bot failing.
- print_activity: If the bot should print what it is doing.
- test_channels: An array of channel IDs to be messaged instead of discord_channels when in test mode.

**ChannelDetails**
A ChannelDetails object represents a channel or channels to send messages to. It is intended to be used when the stocks being sent to a channel differ from the stocks being sent to channels.
For example, a ChannelDetails object can specify additional stocks beyond what is being sent to other channels, or can provide a unique list to use.

A ChannelDetails object consists of:
- id: An ID or array of IDs of the Discord channels to send to
- stocks: An object with stock symbols as the key and stock name as the value
- ignore_default (optional): Channel is only sent stocks from its own list