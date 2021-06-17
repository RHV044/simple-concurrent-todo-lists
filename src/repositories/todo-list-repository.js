// Para ejemplo, de hecho tiene una sola lista segun esto

class TodoListRepository {

    constructor(elements) {
        this.list = elements
    }

    add(element) {
        this.list.push(element)
    }

    remove(element) {
        let index = this.list.indexOf(element)
        this.list.splice(index, 1)
    }

    updatePosition(element, position) {
        this.remove(element)
        this.list[position] = element
    }
}

module.exports = TodoListRepository