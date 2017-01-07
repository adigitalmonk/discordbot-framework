class Queue {
    constructor() {
        this.tasks = [];
    }

    cancel(queue_id) {
        let instance = this.tasks[queue_id];
        return clearTimeout(instance);
    }

    add(callback, timeout) {
        let timer = setTimeout(callback, timeout);
        this.tasks.push(timer);
        return this.tasks.length - 1;
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
