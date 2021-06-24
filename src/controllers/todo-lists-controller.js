const express = require('express');
const ListsService = require("../services/todo-lists-service");
const router = express.Router()
const listsService = new ListsService()

/**
 * POST /lists
 * { "elements": [] }
 *
 * Creates a list.
 */
router.post('/', (req, res) => {
    const elements = req.body.elements
    TodoListsController.handleAction( { type: "CREATE_LIST", elements: elements }, null, res)
})

/**
 * PATCH /lists/:id/availability
 *
 * Returns whether the list is available and then blocks it.
 */
router.patch('/:id/availability', (req, res) => {
    return res.json({isAvailable: listsService.checkAndSetAvailability(req.params.id)})
});

/**
 * POST /lists/:id/items
 * { "item": "do homework" }
 *
 * Adds an item to a list.
 */
router.post('/:id/items', (req, res) => {
    const listId = req.params.id
    const item = req.body.item
    TodoListsController.handleAction( { type: "ADD_ITEM", item: item }, listId, res)
})

/**
 * DELETE /lists/:id/items/:index
 *
 * Deletes the item [index] from the list.
 */
router.delete('/:id/items/:index', (req, res) => {
    const listId = req.params.id
    const itemIndex = req.params.index
    TodoListsController.handleAction( { type: "DELETE_ITEM", index: itemIndex }, listId, res)
})

/**
 * PATCH /lists/:id/items/:index/ready
 *
 * Marks the item [index] from the list as ready.
 */
router.patch('/:id/items/:index/ready', (req, res) => {
    const listId = req.params.id
    const itemIndex = req.params.index
    TodoListsController.handleAction( { type: "READY_ITEM", index: itemIndex }, listId, res)
})

/**
 * PATCH /lists/:id/items/:index/unready
 *
 * Marks the item [index] from the list as unready.
 */
router.patch('/:id/items/:index/unready', (req, res) => {
    const listId = req.params.id
    const itemIndex = req.params.index
    TodoListsController.handleAction( { type: "UNREADY_ITEM", index: itemIndex }, listId, res)
})

/**
 * PUT /lists/:id/items/:index
 * { "item": "take a shower" }
 *
 * Replaces the item [index] with the given.
 */
router.put('/:id/items/:index', (req, res) => {
    const listId = req.params.id
    const index = req.params.index
    const item = req.body.item
    TodoListsController.handleAction( { type: "EDIT_ITEM", index: index, newItem: item }, listId, res)
})

/**
 * PATCH /lists/:id/items/:index/position
 * { "new_index": 4 }
 *
 * Moves the item [index] to the new index.
 */
router.patch('/:id/items/:index/position', (req, res) => {
    const listId = req.params.id
    const itemIndex = req.params.index
    const newIndex = req.body.new_index
    TodoListsController.handleAction( { type: "CHANGE_POSITION", index: itemIndex, newIndex: newIndex }, listId, res)
})

class TodoListsController {
    static handleAction(action, listId, res) {
        const result = listsService.performAction(listId, action)

        if (result.isOk)
            return res.json({ list: result.list })
        else
            return res.status(409).json({ message: result.message })
    }
}

module.exports = router;
