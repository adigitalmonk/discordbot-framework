const Discord = require("discord.js");
const Auditor = require('./auditor.js');
const Registrar = require('./registrar.js');
const Configuration = require('./configuration.js');
const Scheduler = require('./scheduler.js');

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
        this.bot = new Discord.Client();

        // Scheduler gets a reference to this as the default context for callback
        this.scheduler = new Scheduler(this);

        // The listener for the bot to enable commands
        this.enableCommands();
        
        // This is needed to boot the system
        this.bot.on('ready', () => console.log('Connected!'));

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
        return this.configuration.load(config);
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

    getClient() {
        return this.bot;
    }

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
     * -   context: The context to be passed to the callback, if omitted will be the context stored in the Scheduler 
     * 
     * @param {object} options The parameters used for scheduling the task
     * @returns {this} This object (for chaining)
     * 
     * @memberOf Scheduler
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
     * This is the function that binds the 'message' event for listening for commands.
     * This should only be called once during the constructor; every time it gets run will add another place to run commands (duplicating the callback calls)
     * 
     * @memberOf Framework
     */
    enableCommands() {
        this.bot.on('message', (
            msg => {
                let allowed_channels = this.configuration.getSetting('allowed_channels');
                if (
                    allowed_channels
                    && allowed_channels.indexOf(msg.channel.name) < 0
                ) {
                    // If allowed_channels isn't empty and the channel is in the list of allowed channels
                    return;
                }

                // Act on messages from bots?
                if (
                    !this.configuration.getSetting('respond_to_bots') 
                    && msg.author.bot
                ) {
                    // If respond to bots is set to false and the msg is from a bot, stop
                    return;
                }

                let prefix = this.configuration.getSetting('command_prefix');
                if (msg.content.startsWith(prefix)) { // The msg starts with the commands prefix
                    let args = msg.content.split(" ");
                    let cmd_name = args.shift().replace(prefix, "").toLowerCase();
                    this.auditor.track(msg.author.id, cmd_name);

                    if (!this.auditor.permitted(msg.author.id, cmd_name, this.registrar.lookup(cmd_name).rate_limit)) {
                        return;
                    }

                    let cmd_params = this.registrar.lookup(cmd_name);
                    cmd_params.callback(msg);
                }
            }
        ).bind(this));
    }
}

module.exports = Framework;
