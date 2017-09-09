/**
 * This is the function that binds the 'message' event for listening for commands.
 * This should only be called once during the constructor; every time it gets run will add another place to run commands (duplicating the callback calls)
 */

module.exports = (msg, ctx) => {
    let allowed_channels = ctx.configuration.getSetting('allowed_channels');
    if (
        allowed_channels
        && allowed_channels.indexOf(msg.channel.name) < 0
        && msg.channel.type === 'text'
    ) {
        // If allowed_channels isn't empty and the channel is in the list of allowed channels
        return;
    }

    // Act on messages from bots?
    if (
        !ctx.configuration.getSetting('respond_to_bots') 
        && msg.author.bot
    ) {
        // If respond to bots is set to false and the msg is from a bot, stop
        return;
    }

    let prefix = ctx.configuration.getSetting('command_prefix');
    if (msg.content.startsWith(prefix)) { // The msg starts with the commands prefix
        let args = msg.content.split(" ");
        let cmd_name = args.shift().replace(prefix, "").toLowerCase();
        let cmd = ctx.registrar.lookup(cmd_name);

        if (
            !cmd // command is defined
            || !ctx.auditor.permitted(msg.author.id, cmd_name, cmd.rate_limit) // User isn't over the rate limit
            || (['dm', 'group'].indexOf(msg.channel.type) > -1 && !cmd.allow_dm) // Command isn't in a DM
        ) {
            return;
        }

        // Record that the user used a command
        ctx.auditor.track(msg.author.id, cmd_name);

        let cmd_params = ctx.registrar.lookup(cmd_name);
        // Commands get instance of the msg and reference to this bot
        cmd_params.callback(msg, ctx);
    }
};
