# README

## Introduction
Welcome to the wonderful world of Discord bots.  Through creating my own Discord bot, I have put together this basic framework to enable the process.

The purpose of this project is to make it so that anyone can spin up their own Discord bot fairly easily. Simply follow the below instructions and you'll be on the way to your own Discord bot in no time.

This project provides a basic wrapper around functionality presented by [discord.js](https://github.com/hydrabolt/discord.js) project.

## Setup
### Load the Module
The first step to get started is to load the scaffolding.
```
const bot = require('discord-bot');
```

### Add the configuration
Configuration for the bot is provided in the form of a basic object.

How you decide to get the object is at your discretion.
```
const config = {
    'secret_key' : 'my_discord_provided_secret_key'
};
bot.configure(config);
```

The only option that is required for configuration is `secret_key` but the full list of possible options is as follows:

|Configuration Key|Default Value|Note|
|---:|:---:|:---|
|`secret_key`|_(none)_|The client secret key/token provided on the [Discord Developer](https://discordapp.com/login?redirect_to=/developers/applications/me) page. The bot will fail to boot without this.|
|`command_prefix`|'!'|The prefix used for commands, e.g. `!syn|
|`allowed_channels`|[ ] (empty array)|The channels that the bot is allowed to respond in; an empty array means all channels
|`respond_to_bots`|false|Whether or not the bot is allowed to respond to other bots|
_Note: If there is no default value, the framework will throw an Error if one isn't specified_

### Configure the Event Listeners
We can add event listeners to the bot.

```
bot.observe('message', (msg) => console.log(`${msg.author.username} sent a message in #${msg.channel.name}`));
```
The observe function takes the first parameter of the discordjs `Client` event and the second parameter is the callback to bind for it.

_Note: The supported event listeners are based on the event listeners provided by discord.js's Client API, so you can refer to their documentation for that._

Two event listeners are added automatically as part of the framework; one for `'ready'` as it's required for `discord.js` to start, and the other for `message` in order to enable commands.
As event listeners can be added multiple times for the same event, these two event listeners should not affect you or your bot.

### Add commands
We can also add commands to the bot.

```
bot.bind('syn', { 
    'callback' : (msg) => msg.channel.sendMessage('Ack!') 
});
```
The bind function takes in two parameters.
- The first argument is the name of the command (e.g., `syn` => `!syn`).
- The second argument is an object with the required parameters for the command.

|Parameter|Default Value|Note|
|---:|:---:|:---|
|callback|_(none)_|The function to call when the command is called|
|rate_limit|3|The number of times per minute the command can be called.|
_Note: If there is no default value, the system will Error if one isn't specified_

### Connect!
Now that our bot is configured, has it's listeners, and commands added, we can start up the bot.
```
bot.connect();
```

And if everything was done correctly, your bot should log in to Discord successfully.

## Future Plans
- Ability to schedule events for specific times