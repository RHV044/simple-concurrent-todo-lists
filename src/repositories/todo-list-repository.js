
class TodoListRepository {

    constructor(elements) {
        this.lists = elements
    }

    addList(element) {
        this.lists.push(element)
    }

    addItem(id, item) {
        // TODO: Add item and return list
    }

    modifyItem(id, index, item) {
        // TODO: Modify item and return list
    }

    modifyItemReadyStatus(id, index, ready) {
        // TODO: Modify item ready status and return list
    }

    modifyItemPosition(id, index, newIndex) {
        // TODO: Modify item position and return list
    }

    deleteItem(id, index) {
        // TODO: Delete item and return list
    }

    /** Checks whether the list is blocked or not and blocks/unblocks it.
     * Returns true if the list was available. */
    checkAndSetAvailability(id, availability = false) {
        // TODO
        return true;
    }
}

module.exports = TodoListRepository