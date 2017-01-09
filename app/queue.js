/**
 * Very simple queue system that for running tasks in the future
 * 
 * @class Queue
 */
class Queue {
    /**
     * Creates an instance of Queue.
     * 
     * @memberOf Queue
     */
    constructor() {

    }

    /**
     * Cancels the time for a queued instance
     * 
     * @param {Timeout} instance 
     * @returns {bool} success state 
     * 
     * @memberOf Queue
     */
    stop(instance) {
        clearTimeout(instance);
        return true;
    }

    /**
     * Add a callback to fire after a specific number of million seconds has passed
     * 
     * @param {callback} callback The callback to fire after the timeout has passed
     * @param {number} timeout The number of milliseconds to wait before firing the task
     * @returns {Timeout} Instance of the timer
     * 
     * @memberOf Queue
     */
    add(callback, timeout) {
        return setTimeout(callback, timeout);
    }

    /**
     * Add a callback to repeat on an interval after a specific number of million seconds has passed
     * 
     * @param {callback} callback The callback to fire after the timeout has passed
     * @param {number} timeout The number of milliseconds to wait between firing the task
     * @returns {Timeout} Instance of the timer
     * 
     * @memberOf Queue
     */
    repeat(callback, timeout) {
        return setInterval(callback, timeout);
    }

    /**
     * Get the number of milliseconds between two dates 
     * 
     * @param {string} end_date The date to get the time UNTIL
     * @param {string} [start_date] (optional) The date to get the time FROM.  If omitted, assume now.
     * @returns {number} The number of milliseconds between the two date
     * 
     * @memberOf Queue
     */
    getQueueDelay(end_date, start_date) {
        let future_date;
        try { 
            future_date = new Date(end_date);
        } catch (e) {
            throw TypeError('non-valid-date');
        }

        let present_date = start_date ? new Date(start_date) : new Date();
        let delta = (future_date.getTime() - present_date.getTime()); 
        
        // If the difference is less than 0, 
        // we want to queue for 0 (immediately)
        return delta > 0 ? delta : 0;
    }

    /**
     * Schedule a job to run once in the future
     * 
     * @param {callback} callback Function to run in the future
     * @param {string} time_in_future The date in the future to run it at
     * @returns {Timeout} Instance of the timer
     * 
     * @memberOf Queue
     */
    addForTime(callback, time_in_future) {
        let delay = this.getQueueDelay(time_in_future);
        return this.add(callback, delay);
    }

    /**
     * Schedule a job to run multiple times in the future
     * 
     * @param {callback} callback Function to run in the future
     * @param {string} time_in_future The date in the future to start running it at
     * @returns {Timeout} Instance of the timer
     * 
     * @memberOf Queue
     */
    repeatFromTime(callback, time_in_future) {
        let delay = this.getQueueDelay(time_in_future);
        return this.repeat(callback, delay);
    }
}

module.exports = Queue;
