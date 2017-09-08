// This is the maximum number of "minutes" we want to store in the audit history
const audit_backlog = 10;

/**
 * Auditor used when handling the throttling of user calls to commands
 * 
 * @class Auditor
 */
class Auditor {
    /**
     * Creates an instance of Auditor.
     * 
     * @memberOf Auditor
     */
    constructor() {
        this.data = {};
    }

    /**
     * Generate a unique key based on the current timestamp, the user ID, and command name
     * 
     * @param {string} userId A given user's ID (but realistically could be any string)
     * @param {string} commandName A given command name (but realistically could be any string)
     * @returns {object} Object containing the current timestamp and a unique key generated based on the user's ID and command name
     * 
     * @memberOf Auditor
     */
    getKey(userId, commandName) {
        const date = new Date();
        const timestamp = date.getHours() + "" + date.getMinutes();
        return {
            'timestamp' : timestamp, 
            'key' : userId + '|' + commandName
        };
    }

    /**
     * Record that a user used a command
     * 
     * @param {string} userId The user who performed the command
     * @param {string} commandName The command that the user performed
     * @returns {boolean} Success state
     * 
     * @memberOf Auditor
     */
    track(userId, commandName) {
        if (this.data.length > audit_backlog) {
            this.data.pop();
        }

        const {timestamp, key} = this.getKey(userId, commandName);
        this.data[timestamp] = this.data[timestamp] || [];

        // If this.data[key] is undefined set it to 1
        // Otherwise increment it
        this.data[timestamp][key] = this.data[timestamp][key] + 1 || 1;

        // We successfully tracked
        return true;
    }

    /**
     * Check if this user has exceeded the threshold
     * 
     * @param {string} userId The user ID to check the audit for
     * @param {string} commandName The command that the user is executed
     * @returns {boolean} Whether or not the user is allowed to execute a command
     * 
     * @memberOf Auditor
     */
    permitted(userId, commandName, threshold = 0) {
        const occurrences = this.data[this.getKey(userId, commandName)] || 0;
        return occurrences <= threshold;
    }
}

module.exports = Auditor;
