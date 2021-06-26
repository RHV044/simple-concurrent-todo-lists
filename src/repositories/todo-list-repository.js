
class TodoListRepository {

    constructor(elements) {
        this.lists = elements
    }

    createList(list) {
        this.lists.push(list)
    }

    updateList(id, list) {
        // TODO: Update list with the new one and return list
    }

    addItem(id, item) {
        // TODO: Add item and return list
    }

    updateItem(id, index, item) {
        // TODO: Update item and return list
    }

    updateItemReadyStatus(id, index, ready) {
        // TODO: Update item ready status and return list
    }

    updateItemPosition(id, index, newIndex) {
        // TODO: Update item position and return list
    }

    deleteItem(id, index) {
        // TODO: Delete item and return list
    }

    /** Checks whether the list is blocked or not and blocks/unblocks it.
     * Returns true if the list was available. */
    checkAndSetAvailability(id, availability = false) {
        // TODO: Check and set availability
        // return availability?
        return true;
    }
}

module.exports = TodoListRepository