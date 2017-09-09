/**
 * This acts as the data store for the functions used to handle/process incoming messages
 * 
 * @class Handler
 **/
class Handler {

    /**
     * Simple constructor that creates internal storage for the handlers
     * 
     * @memberof Handler
     */
    constructor() {
        this.handlers = new Map();
    }

    /**
     * Add a new handler.  Name is the key when updating / removing later.
     * 
     * The callback is the function that is applied to each message.
     * The context acts as the DI container to provide the function with the necessary objects it needs to do its work.
     * 
     * @param {string} name The name to register the handler as
     * @param {function|object} handler Either a function or an object of the following syntax { "callback" : <function> , "context" : <any> }
     * @memberof Handler
      */
    add(name, handler) {
        if (typeof(handler) === 'function') {
            handler = { 'callback' : handler , 'context' : undefined };
        }
        this.handlers.set(name, handler);
        return this;
    }

    /**
     * Unregister a handler
     * 
     * @param {string} handler The name of the handler to delete/unregister
     * @returns {object} Reference to itself
     * @memberof Handler
     */
    del(handler) {
        this.handlers.delete(handler);
        return this;
    }

    /**
     * Process the given data against a specific handler
     * 
     * @param {string} name The name of the specific handler
     * @param {mixed} data The mixed data to use
     * @returns {bool} False if the handler does exist, true otherwise
     * @memberof Handler
     */
    handleOne(name, data) {
        const handler = this.handlers.get(name);
        if (!handler) return false;
        handler.callback(data, handler.context);
        return true;
    }

    /**
     * Process given data across all registered handlers
     * 
     * @param {any} data The data to process
     * @memberof Handler
     */
    handle(data) {
        this.handlers.forEach(
            params => { params.callback(data, params.context); }
        );
    }

}

module.exports = Handler;
