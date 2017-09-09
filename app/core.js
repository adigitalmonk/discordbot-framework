const Discord = require("discord.js");
const Auditor = require('./auditor.js');
const Registrar = require('./registrar.js');
const Configuration = require('./configuration.js');
const Scheduler = require('./scheduler.js');
const Handler = require('./handler.js');
const CommandsHandler = require('./handlers/commands.js');

/**
 * Scaffolding core structure for the discordjs client
 * 
 * @class Framework
 */
class Framework {

    /**
     * Creates an instance of Framework.
     * 
     * @memberOf Framework
     */
    constructor() {
        this.registrar = new Registrar();
        this.configuration = new Configuration();
        this.auditor = new Auditor();
        this.handler = new Handler();
        this.bot = new Discord.Client();

        // Scheduler gets a reference to this as the default context for callback
        this.scheduler = new Scheduler(this);

        // Enable custom handlers for messages
        this.enableHandlers();

        this.active = false;
    }

    /**
     * Load the config into the configuration manager
     * 
     * @param {object} config
     * @returns {boolean} Success state of loading the configuration
     * 
     * @memberOf Framework
     */
    configure(config) {
        let loaded = this.configuration.load(config);

        if (this.configuration.getSetting('enable_cmds')) {
            // The listener for the bot to enable commands
            this.addHandler('commands', {
                'callback': CommandsHandler,
                'context': this
            });
        }
  
        // This is needed to boot the system
        this.bot.on('ready', () => {
            console.log(this.configuration.getSetting('boot_msg'));
            const gameSetting = this.configuration.getSetting('playing_msg');
            if (gameSetting) {
                this.bot.user.setGame(gameSetting)
                    .then(() => { console.log(`Set playing message to: "${gameSetting}"`); });
            }
        });

        return loaded;
    }

    /**
     * Is the boot actively connected to Discord?
     * 
     * @returns {boolean} Whether or not the bot is connected
     * 
     * @memberOf Framework
     */
    isActive() {
        return this.active;
    }

    /* Listeners */
    /**
     * Start observing an event
     * 
     * @param {string} event The event for which to listen
     * @param {function} callback The callback to fire when the event is triggered
     * 
     * @memberOf Framework
     */
    observe(event, callback) {
        this.bot.on(event, callback);
    }

    
    /**
     * Return the stored discordjs Client object
     * 
     * @returns {Client} DiscordJS Client object
     * 
     * @memberOf Framework
     */
    getClient() {
        return this.bot;
    }

    /**
     * Get a collection of Guilds to which our bot is connected
     * 
     * @returns {Collection<string, Guild>} Collection of guild objects that the bot belongs to
     * 
     * @memberOf Framework
     */
    getGuilds() {
        return this.bot.guilds;
    }

    /* Scheduler */
    /**
     * Add a callback to run periodically
     * The schedule object is used to pass in the parameters used for schedule:
     * -      name: The name of the task to store the schedule for (required)
     * - frequency: How often to run the task (required)
     * -  callback: The callback to fire for the task
     * -  begin_at: The time to start this task at, if omitted will be now
     * -   context: The context to be passed to the callback, if omitted will be the context stored in the scheduler
     * - immediate: Start immediately? Default to false
     * -      once: Only fire it on the next schedule once. Default to false.
     * -  start_of: The timeframe to round the schedule to (ceiling)
     * 
     * @param {object} options The parameters used for scheduling the task
     * @returns {this} This object (for chaining)
     * 
     * @memberOf Framework
     */
    schedule(options) {
        this.scheduler.schedule(options);
        return this;
    }

    /**
     * Remove a task's schedule from the task list
     * Once a schedule is removed, the task will stop running.
     * Note: It does not stop any currently pending tasks, but it stops them from firing in the future.
     * 
     * @param {any} task The name of the schedule to purge, based on the name provided when scheduling
     * @returns {this} This object (for chaining)
     * 
     * @memberOf Scheduler
     */
    unschedule(task_name) {
        this.scheduler.unschedule(task_name);
        return this;
    }

    /* Commands */
    /**
     * Bind a command to the bot
     * 
     * @param {string} command The command to bind
     * @param {object} params The parameters for the command
     * 
     * @memberOf Framework
     */
    bind(command, params) {
        this.registrar.bind(command, params);
    }

    /**
     * Tell the bot to connect to Discord
     * 
     * @returns {boolean} Did the bot connect?
     * @throws {Error} Something went wrong trying to connect to Discord!
     * 
     * @memberOf Framework
     */
    connect() {
        // The configuration has to have been loaded before attempting to boot.
        if (!this.configuration.isLoaded()) {
            return false;
        }

        // The bot uses the secret key to log in
        let secret_key = this.configuration.getSetting('secret_key');

        this.bot.login(secret_key)
            .then(
                (() => this.active = true).bind(this)
            ).catch(
                () => { throw new Error("Failed to log in! Double check your secret key!"); }
            );
        return this.active = true;
    }

    /**
     * Turn off the bot and disconnect from Discord
     * 
     * @returns {boolean} Status of disconnecting from the bot
     * 
     * @memberOf Framework
     */
    disconnect() {
        this.active = false;
        return this.bot.destroy();
    }

    /**
     * Add a new handler.  Name is the key when updating / removing later.
     * 
     * The callback is the function that is applied to each message.
     * The context acts as the DI container to provide the function with the necessary objects it needs to do its work.
     * 
     * @param {string} name The name to register the handler as
     * @param {function|object} handler Either a function or an object of the following syntax { "callback" : <function> , "context" : <any> }
     * @returns {object} this
     * @memberof Framework
     */
    addHandler(name, handler) {
        this.handler.add(name, handler);
        return this;
    }

    /**
     * Unregister a handler
     * 
     * @param {string} handler The name of the handler to delete/unregister
     * @returns {object} this
     * @memberof Framework
     */
    removeHandler(name) {
        this.handler.del(name);
        return this;
    }

    /**
     * Add the listener to the bot that will process the message handlers
     * 
     * @memberof Framework
     */
    enableHandlers() {
        this.bot.on('message', (msg) => {
            this.handler.handle(msg);
        });
    }

    /**
     * Get the registered help messages for each command from the registrar
     * 
     * @returns {object} Object in the style of { 'name' : <command name> , 'value' : <provided help message> }
     * @memberof Framework
     */
    getCmdHelp() {
        return this.registrar.getHelp();
    }
}

module.exports = Framework;
