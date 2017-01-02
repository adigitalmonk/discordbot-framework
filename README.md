# README

## Introduction
Welcome to the wonderful world of Discord bots.  Through creating my own Discord bot, I have put together this basic framework to enable the process.

The purpose of this project is to make it so that anyone can spin up their own simple Discord bot fairly easily. Simply follow the below instructions and you'll be on the way to your own Discord bot in no time.

This project provides a basic wrapper around functionality presented by [discord.js](https://github.com/hydrabolt/discord.js) project.

## Setup
### Load the Module
The first step to get started is to load the scaffolding.
```
const bot = require('discordbot-framework');
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

|Configuration Key|Data Type|Default Value|Note|
|---:|:---:|:---:|:---|
|`secret_key`|integer|_(none)_|The client secret key/token provided on the [Discord Developer](https://discordapp.com/login?redirect_to=/developers/applications/me) page. The bot will fail to boot without this.|
|`command_prefix`|string|'!'|The prefix used for commands, e.g. `!syn|
|`allowed_channels`|array|[ ]|The channels that the bot is allowed to respond in; an empty array means all channels
|`respond_to_bots`|boolean|false|Whether or not the bot is allowed to respond to other bots|
_Note: If there is no default value, the framework will throw an Error if one isn't specified_

### Configure the Event Listeners
We can add event listeners to the bot.

```
bot.observe('message', (msg) => console.log(`${msg.author.username} sent a message in #${msg.channel.name}`));
```
The observe function takes a string for the first parameter, where the string is one of the events defined by the discordjs `Client`. The second parameter is the callback to fire when the event is triggered.

_Note: You can refer to discord.js's Client API documentation [here](https://discord.js.org/#/docs/main/stable/class/Client) for the supported events_

Two event listeners are added automatically as part of the framework; one for `'ready'` as it's required for `discord.js` to start, and the other for `message` which handles processing commands.
As event listeners can be added multiple times for the same event, these two event listeners should not affect the code you write for the bot.

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

|Parameter|Data Type|Default Value|Note|
|---:|:---:|:---:|:---|
|callback|function|_(none)_|The function to call when the command is called.|
|rate_limit|integer|3|The number of times per minute the command can be called by a user.|
_Note: If there is no default value, the system will Error if one isn't specified_

### Connect!
Now that our bot is configured, has it's listeners, and commands added, we can start up the bot.
```
bot.connect();
```
And if everything was done correctly, your bot should log in to Discord successfully.

### Full Example
Here is a working example bot that was set up using the framework.
```
// Load the module
const DiscordBot = require('discordbot-framework');
let bot = new DiscordBot();

// Get the configuration
// Please never ever commit your secret key to a git repository
// See DotEnv in the further reading
const configData = {
    'secret_key'        : 'thisisreallynotasecrettoken',
    'command_prefix'    : '@',
    'respond_to_bots'   : true
};

// Load the configuration into the bot
bot.configure(configData);

// Add a command
bot.bind('syn', {
    'callback': msg => msg.channel.sendMessage('Ack!'),
    'rate_limit': 1
});

// Add a listener
bot.observe('guildMemberAdd', (guildMember) => {
    const nickname = guildMember.nickname || guildMember.user.username;
    guildMember.guild.defaultChannel.sendMessage(`Welcome to the ${guildMember.guild.name} party, ${nickname}!`);
});


// Tell the bot to connect to Discord
bot.connect();
```


## Further Reading
- [Discord.js Documentation](https://discord.js.org/#/docs/main/stable/general/welcome)
- [NodeJS DotEnv](https://www.npmjs.com/package/dotenv) (For configuration storage)

## Future Plans
- Ability to schedule events for specific times
