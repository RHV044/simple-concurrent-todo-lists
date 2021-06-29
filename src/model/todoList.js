
class TodoList {
    constructor(id, title, creator) {
        this.id = id
        this.title = title
        this.creator = creator
        this.list = []
        this.hashVersion = crypto.randomBytes(20).toString('hex');
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