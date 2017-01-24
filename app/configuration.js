/**
 * The configuration handler
 * 
 * @class Configuration
 */
class Configuration {

    /**
     * Creates an instance of Configuration.
     * 
     * @memberOf Configuration
     */
    constructor() {
        this.loaded = false;
        this.data = new Map();

        this.optionSchema = [
            {
                'name'          : 'secret_key',
                'description'   : 'The secret key for your bot',
                'type'          : 'string',
            },
            {
                'name'          : 'command_prefix',
                'description'   : 'The prefix for your bot\'s commands',
                'type'          : 'string',
                'default'       : '!'
            },
            {
                'name'          : 'allowed_channels',
                'description'   : 'The channels that the bot is allowed to talk in (Ctrl+C to stop)',
                'type'          : 'array',
                'default'       : []
            },
            {
                'name'          : 'respond_to_bots',
                'description'   : 'Whether or not the bot can respond to other bots',
                'type'          : 'boolean',
                'default'       : false
            },
            {
                'name'          : 'boot_msg',
                'description'   : 'Message shown on the command line when the bot connects.',
                'type'          : 'string',
                'default'       : 'Connected!'
            },
            {
                'name'          : 'playing_msg',
                'description'   : 'The message shown as the "Playing ____" message for the bot',
                'type'          : 'string',
                'default'       : false
            }
        ];

    }

    /**
     * Get the schema/parameters for a specific object
     * 
     * @param {string} option The name of the option to get the schema for
     * @returns
     * 
     * @memberOf Configuration
     */
    getSchema(option) {
        return this.optionSchema.find(schema => schema.name === option);
    }

    /**
     * Get the options that are defined by the schema.
     * Loosely based on promptjs's schema syntax
     * 
     * @returns {array} The name of the options that are supported
     * 
     * @memberOf Configuration
     */
    options() {
        return this.optionSchema.reduce((options, option) => {
            options.push(option.name);
            return options;
        }, []);
    }

    /**
     * Get the configured setting for a given option
     * 
     * @param {string} option
     * @returns {any} What the option is configured as
     * 
     * @memberOf Configuration
     */
    getSetting(option) {
        return this.data.get(option);
    }

    /**
     * Update a setting as needed
     * 
     * @param {string} option The option for which to change the setting
     * @param {any} value The new setting value for the option.
     * @returns {boolean} Success state (always true)
     * 
     * @memberOf Configuration
     */
    setSetting(option, value) {
        this.data.set(option, value);
        return true;
    }

    /**
     * Load a config into the configuration manager
     * 
     * @param {object} config
     * @returns {boolean} Success state of loading the configuration
     * 
     * @memberOf Configuration
     */
    load(config) {
        // Reset the data object
        this.data.clear();

        const options = this.options();

        // Iterate over the options and pull the settings from the config obj or default from schema
        for (let option of options) {
            let defaultVal = this.getSchema(option).default;
            if (config[option]) {
                this.data.set(option, config[option]);
            } else if (defaultVal !== undefined) {
                this.data.set(option, defaultVal);
            } else {
                throw new Error('missing-option-' + option);
            }
        }

        return this.loaded = true;
    }

    /**
     * Is the configuration loaded yet?
     * 
     * @returns {boolean} Whether or not the configuration is loaded
     * 
     * @memberOf Configuration
     */
    isLoaded() {
        return this.loaded;
    }

}

module.exports = Configuration;
