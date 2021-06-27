const TodoList = require('../model/todoList');

class TodoListRepository {

    constructor(elements) {
        this.lists = elements
        this.index = 0
    }

    createList(list) {
        const todoList = new TodoList(this.index, list.title, list.creator)
        this.lists.push(todoList)
        this.index += 1
        return todoList
    }

    /** Updates list on commit  */
    updateList(id, list) {
        this.findList(id).list = list
    }

    addItem(id, item) {
        const list = this.findList(id).list
        list.push(item)
        return list
    }

    updateItemText(id, index, text) {
        const list = this.findList(id).list
        list[index].text = text
        return list
    }

    updateItemDoneStatus(id, index, done) {
        const list = this.findList(id).list
        list[index].done = done
        return list
    }

    updateItemPosition(id, index, newIndex) {
        const list = this.findList(id).list
        const element = list[index];
        list.splice(index, 1);
        list.splice(newIndex, 0, element);
        return list
    }

    deleteItem(id, index) {
        const list = this.findList(id)
        list.splice(index, 1)
        return list
    }

    /** Checks whether the list is blocked or not and blocks/unblocks it.
     * Returns true if the list was available. */
    checkAndSetAvailability(id, availability = false) {
        const list = this.findList(id)
        const currentAvailability = list.availability
        list.availability = availability
        return currentAvailability;
    }

    findList(id) {
        return this.lists.find(todoList => todoList.id === id)
    }
}

module.exports = TodoListRepository