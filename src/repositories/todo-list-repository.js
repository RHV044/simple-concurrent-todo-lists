const TodoList = require('../model/todoList');
const Utils = require('./src/utils');
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
        return this.updatedList(list)
    }

    updateItemText(id, index, text) {
        const list = this.findList(id).list
        list[index].text = text
        return this.updatedList(List)
    }

    updateItemDoneStatus(id, index, done) {
        const list = this.findList(id).list
        list[index].done = done
        return this.updatedList(list)
    }

    updateItemPosition(id, index, newIndex) {
        const list = this.findList(id).list
        const element = list[index];
        list.splice(index, 1);
        list.splice(newIndex, 0, element);
        return this.updatedList(list)
    }

    deleteItem(id, index) {
        const list = this.findList(id)
        list.splice(index, 1)
        return this.updatedList(list)
    }

    updatedList(list) {
        list.hashVersion = Utils.generateRandomHash();
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
