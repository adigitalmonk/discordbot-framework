class Queue {
    constructor() {
    }

    cancel(timer) {
        return clearTimeout(instance);
    }

    add(callback, timeout) {
        return setTimeout(callback, timeout);
    }

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

    addForTime(callback, time_in_future) {
        let delay = this.getQueueDelay(time_in_future);
        return this.add(callback, delay);
    }
}

module.exports = Queue;
