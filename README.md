# Introduction

Welcome to the wonderful world of Discord bots.  Through creating my own Discord bot, I have put together this basic framework to facilitate the process.

The purpose of this project is to simplify the process of creating a Discord bot so that anyone can create one with minimal effort. Simply follow the instructions below and you will be on your way to creating your own Discord bot in no time.

This project provides a basic wrapper around functionality produced by the [discord.js](https://github.com/hydrabolt/discord.js) project.

# Setup

## Prerequisites

### Node

This project requires the installation of [NodeJS / npm](https://nodejs.org/en/) to be able to run and install the bot. Specifically, you need NodeJS to run the program and npm as a packet manager to download all project dependencies.

Once NodeJS and npm is installed, navigate to the folder in which you would like to create your bot. In the terminal/command prompt type one of the following lines and hit enter to download the framework:

From NPM:
- `npm install discordbot-framework`

From GitHub:
- `npm install adigitalmonk/discordbot-framework#master`
- `npm install adigitalmonk/discordbot-framework#<release_tag>`

This will download the framework and all the dependencies needed to get your bot up and running. 

### Configure Bot to Server

To create the bot application, you can navigate to the [Discord Application](https://discordapp.com/developers/applications/me) page and follow the below steps from there.

_Note: You need to be an admin of the server which you would like to add the bot to._

- Click "New App" or follow this [link](https://discordapp.com/developers/applications/me/create).
- Enter a name
- Click "Create App"
- Click "Create a Bot User"
- Click "Yes"
- Copy the Client ID value and continue to the _Add Bot to Server_ section
- Navigate to the link "https://<span></span>discordapp.com/oauth2/authorize?scope=bot&client_id=[bot_client_id]" where [bot_client_id] is the Client ID you copied earlier on
- Select the server desired
- Click "Authorize"

The bot should now be added to your server and ready to be programmed. For more information please visit the [Discord Documentation](https://discordapp.com/developers/docs/topics/oauth2#bot-authorization-flow) on bots.

## Load the Module

The first step to get started is to load the scaffolding of the project. Add this line of code to your project to be able to access all the features of the framework.

```javascript
const DiscordBot = require('discordbot-framework');
let bot = new DiscordBot();
```

## Add the configuration

Configuration for the bot is provided in the form of a basic object, how you decide to access the object is at your own discretion.

```javascript
const config = {
    'secret_key' : 'my_discord_provided_secret_key'
};
bot.configure(config);
```

The only option that is required for configuration is `secret_key` but, the full list of possible options are as follows:

|Configuration Key|Data Type|Default Value|Note|
|:--:|:---|:---:|:---|
|`secret_key`|integer|_(none)_|The client secret key/token provided on the [Discord Developer](https://discordapp.com/developers/applications/me) page. This is required for the bot to be able to run.|
|`command_prefix`|string|'!'|The prefix used for commands, e.g. `!syn`|
|`allowed_channels`|array|[ ]|The channels which the bot is allowed to respond in; an empty array means all channels.|
|`respond_to_bots`|boolean|false|Whether or not the bot is allowed to respond to other bots.|
|`playing_msg`|string|false|The "Playing" message for the bot, if `false` will skip this feature.|
|`boot_msg`|string|"Connected!"|This is just the message that shows up on the command line when you boot the bot up, only really shown to the person starting the bot.|
|`enable_cmds`|boolean|true|Setting this to false will tell the bot to skip adding the commands handler; useful if you want to have a non-command based bot.|

_Note: If there is no default value, the framework will throw a runtime Error if one is not specified._

## Configure the Event Listeners

We can add event listeners to the bot.

```javascript
bot.observe('message', (msg) => {
    console.log(`${msg.author.username} sent a message in #${msg.channel.name}`);
});
```

The `observe` function takes a string for the first parameter, where the string is one of the events defined by the discordjs `Client`. The second parameter is the callback to fire when the event is triggered.

Two event listeners are added automatically as part of the framework; one for `'ready'` as it's required for `discord.js` to start, and the other for `message` which runs all of the message handlers (including commands, provided you don't disable them).
As event listeners can be added multiple times for the same event, these two event listeners should not affect the code you write for the bot.

## Add commands

We can also add commands to the bot.

```javascript
bot.bind('syn', {
    'callback'      : (msg) => msg.channel.sendMessage('Ack!'),
    'help_message'  : 'Is the bot listening? \n\tUsage: `!syn`',
    'allow_dm'      : true
});
```

The `bind` function takes in two parameters.
- The first argument is the name of the command (e.g., `syn` => `!syn`).
- The second argument is an object with the required parameters for the command.

|Parameter|Data Type|Default Value|Note|
|:--:|:---|:---:|:---|
|`callback`|function|_(none)_|The function to call when the command is called.|
|`rate_limit`|integer|3|The number of times per minute the command can be called by a user.|
|`allow_dm`|boolean|false|Whether or not the bot will respond to this command if it's in a direct message|
|`help_message`|string|"[undocumented]"|The help message for this command.|

_Note: If there is no default value, the system will Error if one is not specified._

### Command Callbacks

The callback registered for a command is passed two parameters.  The first parameter is a reference to the [Message](https://discord.js.org/#/docs/main/stable/class/Message) object generated by the DiscordJS `message` event. The second parameter is a reference to the framework instance itself which allows your command to interact with data stored as part of the instance (such as the task scheduler or [Client](https://discord.js.org/#/docs/main/stable/class/Client)).

I have found convenience in writing my callbacks into their own module and then importing from there. This gives the callback a complete closure to work with.

```javascript
const {isup} = require('./commands/status.js');
bot.bind('isup', {
    'callback'      : isup,
    'help_message'  : "Check if a server is online.\n\tUsage: `!isup <webpage>`"
});
```

### Command Help Messages

The system makes no implications for what you can do with the help message parameter, which is why it is optional.
There is a command on the bot framework `getCmdHelp()` that will return an array that used in an `Embed` message

Here is an example implementation:

```javascript
bot.bind('help', {
    'help_message'  : 'This message.\n\tUsage: `!help`',
    'callback'      : (msg, bot) => {
        let help = bot.getCmdHelp();
         msg.author.sendEmbed({
            'color'       : 0x229922,
            'title'       : "My Bot's Help",
            'fields'      : help,
            'timestamp'   : new Date()
        });
    },
    'allow_dm'      : true
});
```

## Custom Message Handlers
We can write custom handlers for messages to perform actions that aren't related to commands.

There are two methods related to this.
- `addHandler` will create a new one and expects a name for the handler as well as the handler itself. It also supports passing in a DI object/context parameter.
- `removeHandler` can be used to delete a handler for a given name.

The first parameter of a handler will always be a [Message object](https://discord.js.org/#/docs/main/stable/class/Message) from the Discordjs `message` [Client](https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=message) event.  The second parameter will be the DI object/context.

Here's a basic example...
```
let counter = 0;
bot.addHandler('counter', (msg) => {
    counter += 1;
    console.log(`I have received ${counter} messages so far!`);
});

bot.removeHandler('counter');
```

And here's an example where we use the context object.  Instead of passing in a function directly, we want to pass an object with two keys, `callback` and `context`.  The callback defined will receive too parameters.  The first parameter is the message object itself, the second parameter is the context provided.

```
const customHandler = require('./my-handler.js');
const DB = require('./my-db.js');

bot.addHandler('myCustomHandler', {
    'callback': customHandler,
    'context' : DB
});
```

In the above example, `my-handler.js` exports a function that starts like...
```
module.exports = (msg, context) => {
    // ...
```

And here's one more example that is a modification of the counter example from earlier to use the context parameter.  I create a simple object to store my simple counter in and pass that as my context, rather than relying on the function closure.
```
let counter = 0;
bot.addHandler('counter', {
    'callback' : (msg, ctx) => {
        ctx.counter += 1;
        console.log(`I have seen ${ctx.counter} messages so far!`);
    },
    'context' : { counter }
});
```

## Schedule Events

We can schedule functions to run at specific times.

This is convenient if we want something to happen on a specific schedule.

```javascript
bot.schedule({
    'name'      : 'server-list',
    'frequency' : 'hourly',
    'callback'  : (instance) => {
        let servers = instance.getGuilds().reduce((list, guild) => { list.push(guild.name + "|" + guild.id); return list; }, []);
        console.log('I am connected to the following servers: ' + servers.join(', '));
    }
});
```
By default, the parameter sent in to the callback is a reference to the framework itself, but this can be specified as one of the parameters as seen in the below (fairly useless) example.

```javascript
// Create some data we want to send in
let days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

bot.schedule({
    'name'      : 'hourly-notice',
    'frequency' : 'hourly',
    'start_of'  : 'hour',
    'context'   : {bot, days}, // Short hand object notation, we still want to send the bot instance, but we want to also send in the data we created
    'callback'  : (context) => {
        context.bot.getGuilds().first().defaultChannel.sendMessage(`Hello! I am only available on the following days: ${context.days.join(', ')}`);
    }
});
```

|Parameter|Data Type|Default Value|Note|
|:--:|:--:|:---|:---|
|`name`|String|_(none)_|**(Required)** The name of the task for scheduling purposes. Names must be unique.|
|`frequency`|String|_(none)_|**(Required)** The timeframe for which to fire the event; see the supported schedules table below.|
|`callback`|function|_(none)_|**(Required)** The callback to trigger on the schedule.|
|`begin_at`|String/momentjs Timestamp|now|A timestamp at which point to start this task; can be string or momentjs instance.|
|`start_of`|String|_(none)_|This is used to jump your task the start of the next schedule. e.g., `hour` means start of next hour, start at `3:44 -> 4:00 -> 5:00`.  If omitted, it will just schedule for the next increment. e.g., `3:44 -> 4:44 -> 5:44`.|
|`context`|Any|Framework|This is the value that will be passed into the callback parameter, the default is the instance of the framework but this would allow you to pass in anything.|
|`immediate`|Boolean|false|This will fire the function once before scheduling it|
|`once`|Boolean|false|Whether or not to reschedule the task after it has run the first time (not including the `immediate` run, so `once` + `immediate` = two executions)|

The following frequencies are defined as within the limitations of NodeJS's `setTimeout` / `setInterval` maximum supported delay.

|Frequency|Definition|
|:----|:----|
|deciminute|Every ten seconds*|
|minute|Every minute|
|hourly|Every hour|
|daily|Every day|
|weekly|Every 7 days|
|biweekly|Every 14 days|

_* `deciminute` was created for testing, but the option was left because there is probably a use case for it. I recommend **against** hitting the Discord API every ten seconds, but that doesn't mean you can't use it internally._

The following `start_of` options are supported.

|`start_of` Options|
|:---:|
|year|
|month|
|quarter|
|week|
|isoweek|
|day|
|date|
|hour|
|minute|
|second|

_This is handled using the `momentjs` `startOf` function. For examples of what specifically these options mean, see the [MomentJS documentation](http://momentjs.com/docs/#/manipulating/start-of/) regarding the function._


## Connect!

Now that our bot is configured, has its listeners, and commands added, we can start up the bot.

```javascript
bot.connect();
```
And if everything went according to plan, your bot should log in to Discord successfully.

# Full Example

Here is a working example bot that was set up using the framework.

```javascript
// Load the module
const DiscordBot = require('discordbot-framework');
let bot = new DiscordBot();

// Get the configuration
// Please never ever commit your secret key to a git repository
// See DotEnv in the references
const configData = {
    'secret_key'        : 'thisisreallynotasecrettoken',
    'command_prefix'    : '@',
    'respond_to_bots'   : true,
    'boot_msg'          : 'I have connected!',
    'playing_msg'       : 'I am a bot!'
};

// Load the configuration into the bot
bot.configure(configData);

// Add a command
bot.bind('syn', {
    'callback'  : msg => msg.channel.sendMessage('Ack!'),
    'rate_limit': 1,
    'allow_dm'  : true
});

// Add a listener
bot.observe('guildMemberAdd', (guildMember) => {
    const nickname = guildMember.nickname || guildMember.user.username;
    guildMember.guild.defaultChannel.sendMessage(`Welcome to the ${guildMember.guild.name} party, ${nickname}!`);
});

// Add an event to the schedule
bot.schedule({
    'name'      : 'server-list',
    'frequency' : 'hourly',
    'callback'  : (instance) => {
        let servers = instance.getGuilds().reduce((list, guild) => { list.push(guild.name + "|" + guild.id); return list; }, []);
        console.log('I am connected to the following servers: ' + servers.join(', '));
    }
});

bot.bind('help', {
    'help_message'  : 'This message.\n\tUsage: `!help`',
    'callback'      : (msg, bot) => {
        let help = bot.getCmdHelp();
         msg.author.sendEmbed({
            'color'       : 0x229922,
            'title'       : "My Bot's Help",
            'fields'      : help,
            'timestamp'   : new Date()
        });
    },
    'allow_dm'      : true
});

let counter = 0;
bot.addHandler('counter', (msg) => {
    counter += 1;
    console.log(`I have seen ${counter} messages so far!`);
});

// Tell the bot to connect to Discord
bot.connect();
```

Now to run the bot, simply go into your terminal/command prompt at the location which the file exists and type `node <filename>.js` and hit enter, where `<filename>` is the name of the file you created. This should start the bot and if successfully, the terminal/command prompt will have your `boot_msg` printed in it, in this example it would be "I have connected!".

# References

|Link|Description|
|:--:|:--|
|[Discord.js Documentation](https://discord.js.org/#/docs/main/stable/general/welcome)|Main repository for documentation on the Discord.js API|
|[momentJS](http://momentjs.com/)|The library used in the task scheduler|
|[NodeJS DotEnv](https://www.npmjs.com/package/dotenv)|Project designed for the purpose of loading configurations into projects|

# Change Log

## v1.4.0

- Added new functionality to write custom message handlers/processors
- Refactored how commands are processed using the custom handlers (command support can now be turned off if desired)

## v1.3.1

- Updated the dependencies to account for an issue with NPM loading `uws`.
- Fixed a small typo in the README, oops!

## v1.3.0

- Added new configuration options `playing_msg` and `boot_msg`

## v1.2.1

- Fixed an issue where the `allow_dm` setting wasn't respected

## v1.2.0

- Added support for storing and retrieving help messages for commands
- Added support for configuring commands to work in DMs
- Command callbacks now receive a second parameter with a reference to the framework instance

## v1.1.1

- Fix an issue in which the bot would crash if someone used a command that didn't exist

## v1.1.0

- Support for scheduling tasks to run on rotations!

## v1.0.1

- Fixed some derps in the README file

## v1.0.0

- Initial Release!
- Support for:
  - Adding commands
  - Listening for events
