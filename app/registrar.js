// Define parameter options for when registering commands
// If the value is undefined, there is no default and it is
//      required to be configured when registering (e.g., callback)
const param_options = {
    'callback'      : undefined, // The callback to use for the command
    'rate_limit'    : 3,       // Number of uses/minute before we rate limit a user
    'help_message'  : '[undocumented]', // The help / usage information for a command
    'allow_dm'      : false, // Whether a command can be used in a direct message
};

class Registrar {

    /**
     * constructor - Initializes the cmd_map for this object 
     */
    constructor() {
        this.cmd_map = {};
    }

    getHelp() {
        let help = [];
        for (let cmd in this.cmd_map) {
            help.push({
                'name' : cmd, 
                'value' : this.cmd_map[cmd].help_message
            });
        }
        return help;
    }

    /**
     * Verify the command parameters used for registering a command
     * 
     * @param in_params {object}  Key/value pairs intended for use as settings
     * @returns {object} approved settings for the command
     */
    verifyParams(in_params = {}) {
        let out_params = {};
        for (let opt in param_options) {
            let setting = in_params[opt] || param_options[opt];
            if (setting === undefined) {
                throw new Error('missing-param-key-' + opt);
            }
            out_params[opt] = setting;
        }
        return out_params;
    }

    /**
     * Register a command
     * 
     * @param cmd {string}        Key for the command to be registered as / triggered as
     * @param cmd_params {object} Key/value pairs to use as settings for registering the command
     */
    bind(cmd, cmd_params) {
        let params = this.verifyParams(cmd_params);
        this.cmd_map[cmd] = params;
        return true;
    }

    /**
     * Gets the settings for a given command
     * 
     * @param cmd {string} The name of the command to look up
     * @returns {object} The stored parameters (or undefined if the command doesn't exist)
     */
    lookup(cmd) {
        return this.cmd_map[cmd];
    }

}

module.exports = Registrar;
