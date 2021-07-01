const Utils = require('../utils');
class TodoList {
    constructor(id, title, creator) {
        this.id = id
        this.title = title
        this.creator = creator
        this.list = []
        this.hashVersion = Utils.generateRandomHash()
        this.availability = true
    }
}

class Item {
    constructor(text, done) {
        this.text = text
        this.done = done
    }
}

module.exports = TodoList