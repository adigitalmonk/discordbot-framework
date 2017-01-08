const moment = require('moment');
const Queue = require('./queue.js');

// Defitions of what constitutes a given schedule
// The values are based on what's supported by the momentJS library
const timeAdjustment = {
    'deciminute': { 'seconds': 10 },
    'minute'    : { 'minutes' : 1 },
    'hourly'    : { 'hours' : 1 },
    'daily'     : { 'days' : 1 },
    'weekly'    : { 'days' : 7 },
    'monthly'   : { 'months' : 1 }
};

/**
 * Simple task scheduling system
 * 
 * @class Scheduler
 */
class Scheduler {

    /**
     * Creates an instance of Scheduler.
     * 
     * @param {any} context The default context that will be passed as a parameter to task callbacks
     * 
     * @memberOf Scheduler
     */
    constructor(context) {
        this.queue = new Queue(); // Queue object
        this.context = context; // Default context for tasks
        this.tasks = {}; // Task list
    }

    /**
     * Get the next date based on a given frequency (defined in the timeAdjustment object)
     * 
     * @param {string} frequency String
     * @param {mixed} beginAt String value of a datetime or a momentjs instance used to define the time to use as the basis for when to start this
     * @returns {string} The next date from the start date
     * 
     * @memberOf Scheduler
     */
    getNext(task) {
        let {frequency, begin_at, start_of} = this.tasks[task];

        // From the beginAt time frame, adjust by the appropriate adjustment
        let nextDate = moment(begin_at).add(timeAdjustment[frequency]);

        if (start_of) {
            nextDate.startOf(start_of);
        }

        // Return the string timeframe for our timer
        return nextDate.format('YYYY-MM-DD HH:mm:ss');
    }

    /**
     * Change the default context for the schedular
     * 
     * @param {any} context The default context that will be passed as a parameter to task callbacks
     * @returns {this} This object (for chaining)
     * 
     * @memberOf Scheduler
     */
    setContext(context) {
        this.context = context;
        return this;
    }

    /**
     * Remove a task's schedule from the task list
     * Once a schedule is removed, the task will stop running.
     * 
     * Note: It does not stop any currently pending schedules
     * 
     * @param {any} task
     * @returns {this} This object (for chaining)
     * 
     * @memberOf Scheduler
     */
    unschedule(task) {
        delete this.tasks[task];
        return this;
    }

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
     * @memberOf Scheduler
     */
    schedule(options) {

        // Make sure the important stuff is included in the scheduler object
        if (
            options === undefined 
            || options.frequency === undefined
            || options.name  === undefined
            || options.callback === undefined
        ) {
            throw new TypeError('invalid-missing-options');
        }

        // Do we only do this task once?
        options.once = options.once || false;

        // Context is optional here
        // If not defined, just pull for this
        options.context = options.context || this.context;

        // Store the options into the task list
        this.tasks[options.name] = options;

        // Start the first queue of this task
        this.enqueue(options.name, options.begin_at);

        // If declared as immediate, it'll fire immediately as well
        if (options.immediate) {
            options.callback(options.context);
        }

        // Return this so we can chain more
        return this;
    }

    /**
     * Queue up a task
     * 
     * @param {string} task The name of the task to queue up
     * @returns {integer} ID of the queued task
     * 
     * @memberOf Scheduler
     */
    enqueue(task, begin_at) {
        let options = this.tasks[task];
        if (options === undefined) { 
            // The task was either unscheduled
            // or no schedule exists for the name
            return true;
        }

        // Get the next timestamp from now for this task
        let nextDate = this.getNext(task);

        // Queue the callback for the callback so we can call back the callback after we fire the callback
        return this.queue.addForTime((() => {
            if (!options.once) {
                this.enqueue(options.name);
            }
            options.callback(options.context);
       }).bind(this), nextDate);
    }

}

module.exports = Scheduler;
