'use strict';

const State = require('./State.js')


class Response extends State{
    constructor(content){
        super(Response.getClass());
        this.content = content;
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }

    static fromBuffer(buffer) {
        return Response.deserialize(buffer);
    }

    static deserialize(data) {
        return State.deserializeClass(data, Response);
    }
}

module.exports = Response;