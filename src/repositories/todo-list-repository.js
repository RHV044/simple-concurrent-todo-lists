const TodoList = require('../model/todoList');

class TodoListRepository {

    constructor(elements) {
        this.lists = elements
        this.index = 0
    }

    get() {
        return this.lists;
    }

    createList(list) {
        const todoList = new TodoList(this.index, list.title, list.creator)
        this.lists.push(todoList)
        this.index += 1
        return todoList
    }

    getList(id) {
        return this.findList(id)
    }

    /** Updates list on commit  */
    updateList(id, list) {
        this.findList(id).list = list
    }

    addItem(id, item) {
        const todoList = this.findList(id)
        todoList.list.push(item)
        return todoList
    }

    updateItemText(id, index, text) {
        const todoList = this.findList(id)
        todoList.list[index].text = text
        return todoList
    }

    updateItemDoneStatus(id, index, done) {
        const todoList = this.findList(id)
        todoList.list[index].done = done
        return todoList
    }

    updateItemPosition(id, index, newIndex) {
        const todoList = this.findList(id)
        const element = todoList.list[index];
        todoList.list.splice(index, 1);
        todoList.list.splice(newIndex, 0, element);
        return todoList
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
        return this.lists.find(todoList => todoList.id == id)
    }
}

module.exports = TodoListRepository
