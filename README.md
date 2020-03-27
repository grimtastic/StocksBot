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
- use_image: If an image should be sent as a message instead of an embed.

**ChannelDetails**
A ChannelDetails object represents a channel or channels to send messages to. It is intended to be used when the stocks being sent to a channel differ from the stocks being sent to channels.
For example, a ChannelDetails object can specify additional stocks beyond what is being sent to other channels, or can provide a unique list to use.

A ChannelDetails object consists of:
- id: An ID or array of IDs of the Discord channels to send to.
- stocks: An object with stock symbols as the key and stock name as the value.
- ignore_default (optional): Channel is only sent stocks from its own list.
- use_image: Overrides main setting of the same name.

## Image Message
If the "use_image" setting is set to true, an image will be produced that shows the stocks and their data, and that image will be sent to the channel(s) as the message.

To produce this image, the bot takes an HTML file (template.html), replaces placeholder text ("{stocks}") with HTML generated for the stocks, renders the HTML to an image and sends the image to the channel(s).

To allow the style of the image to be easily customisable, all style is handled in the template file. Each part of the HTML generated for the stocks has an associated id or class name so that it can be styled simply by editing the template. These are:

**IDs**
- stocks: The element that contains all the headers and data elements.
- symbol: The header for the "symbol" column.
- name: The header for the "name" column.
- price: The header for the "price" column.
- change: The header for the "change" column.
- change-perc: The header for the "change percentage" column.

**Classes**
- inc: Any element for a stock that has increased in value.
- dec: Any element for a stock that has decreased in value.
- symbol-value: Symbol of stock.
- name-value: Name of stock.
- price-value: Price of stock.
- change-value: Price change of stock.
- change-perc-value: Percentage of price change of stock.

**Image Test Script**
The Node.js script "make-test-image.js" will take the main stocks from the config file and produce an example image using them. This is good for testing your template without having an image sent to Discord. The data is randomly generated so no API keys or even internet connection is needed.