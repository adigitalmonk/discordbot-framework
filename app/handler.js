
class Handler {

    constructor() {
        this.handlers = new Map();
    }

    add(handler, params) {
        if (typeof(params) === 'function') {
            params = { 'callback' : params , 'context' : undefined };
        }
        this.handlers.set(handler, params);
    }

    del(handler) {
        return this.handlers.delete(handler);
    }

    get(handler) {
        return this.handlers.get(handler);
    }

    getAll() {
        return this.handlers;
    }

}

module.exports = Handler;
