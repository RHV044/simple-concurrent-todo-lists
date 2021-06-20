
class TodoListRepository {

    constructor(elements) {
        this.lists = elements
    }

    addList(element) {
        this.lists.push(element)
    }

    removeList(id) {
       // TODO
    }

    /** Checks whether the list is blocked or not and blocks it if it wasn't.
     * Returns true if the list was available. */
    checkAndSetAvailability(id) {
        // TODO
        return true;
    }

    isAvailable(id) {
        // TODO
        return true;
    }
}

module.exports = TodoListRepository