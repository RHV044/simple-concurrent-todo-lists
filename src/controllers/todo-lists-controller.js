const express = require('express');
const ListsService = require("../services/todo-lists-service");
const router = express.Router()
const listsService = new ListsService()

// ---------------------- LIST ENDPOINTS ----------------------//

/**
 * POST /lists
 * { "elements": [] }
 *
 * Creates a list.
 */
router.post('/', (req, res) => {
    const elements = req.body.elements
    TodoListsController.handleResult(listsService.createList(elements), res)
})

/**
 * PATCH /lists/:id/availability
 *
 * Returns whether the list is available and then blocks it.
 */
router.patch('/:id/availability', (req, res) => {
    return res.json({isAvailable: listsService.checkAndSetAvailability(req.params.id)})
});

// ---------------------- ITEM ENDPOINTS ----------------------//

/**
 * POST /lists/:id/items
 * { "item": "do homework" }
 *
 * Adds an item to a list.
 */
router.post('/:id/items', (req, res) => {
    const listId = req.params.id
    const item = req.body.item
    TodoListsController.handleResult(listsService.addItem(listId, item), res)
})

/**
 * PUT /lists/:id/items/:index
 * { "item": "take a shower" }
 *
 * Replaces the item [index] with the given.
 */
router.put('/:id/items/:index', (req, res) => {
    const listId = req.params.id
    const itemIndex = req.params.index
    const item = req.body.item
    TodoListsController.handleResult(listsService.modifyItem(listId, itemIndex, item), res)
})

/**
 * PATCH /lists/:id/items/:index/ready?status=:status
 * { "status": true }
 *
 * Changes the item [index] ready status from the list as [status].
 */
 router.patch('/:id/items/:index/ready', (req, res) => {
    const listId = req.params.id
    const itemIndex = req.params.index
    const ready = req.query.status
    TodoListsController.handleResult(listsService.markItemReadiness(listId, itemIndex, ready), res)
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
    TodoListsController.handleResult(listsService.moveItem(listId, itemIndex, newIndex), res)
})

/**
 * DELETE /lists/:id/items/:index
 *
 * Deletes the item [index] from the list.
 */
 router.delete('/:id/items/:index', (req, res) => {
    const listId = req.params.id
    const itemIndex = req.params.index
    TodoListsController.handleResult(listsService.deleteItem(listId, itemIndex), res)
})

// ---------------------- COMMIT ENDPOINTS ----------------------//

/**
 * POST /lists/:id/items/commit
 *
 * Commits the item creation on the list that other instances verified. 
 * It also makes the list available after the change is made.
 * 
 */

router.post('/:id/items/commit', (req, res) => {
    const listId = req.params.listId
    const item = req.params.item

    const newItem = todoListsItemsService.addItem(listId, itemValue)

    if (newItem) {
        return res.status(201).json({status: "Successful commit: item created"})
    } else {
        // TODO: Handle this scenario?
        return res.status(404).json({ message: "Couldn't commit the item creation." })
    }
});
  
/**
 * PUT /lists/:id/items/:index/commit
 *
 * Commits the item [index] modification on the list that other instances verified. 
 * It also makes the list available after the change is made.
 * 
 */
  
 router.put('/:id/items/:index/commit', (req, res) => {
    const listId = req.params.id
    const itemIndex = req.params.index
    const item = req.body.item

    const item = todoListsItemsService.get(listId, itemIndex)

    if (item) {
        todoListsItemsService.modifyItem(listId, itemIndex, item)
        return res.status(201).json({status: "Successful commit: item modified"})
    } else {
        // TODO: Handle this scenario?
        return res.status(404).json({ 
            message: "Couldn't commit the item modification because the resource does not exist." 
        })
    }
});

/**
 * PATCH /lists/:id/items/:index/ready/commit?status=:status
 *
 * Commits the item [index] ready status [status] modification on the list that 
 * other instances verified. It also makes the list available after the change is made.
 * 
 */

router.patch('/:id/items/:index/ready/commit', (req, res) => {
    const listId = req.params.id
    const itemIndex = req.params.index
    const ready = req.query.status

    const item = todoListsItemsService.get(listId, itemIndex)

    if (item) {
        todoListsItemsService.modifyItemReadyStatus(listId, itemIndex, ready)
        return res.status(201).json({status: "Successful commit: item modified"})
    } else {
        // TODO: Handle this scenario?
        return res.status(404).json({ 
            message: "Couldn't commit the item modification because the resource does not exist." 
        })
    }
})

/**
 * PATCH /lists/:id/items/:index/position/commit
 *
 * Commits the item [index] position modification on the list that other instances verified. 
 * It also makes the list available after the change is made.
 * 
 */

router.patch('/:id/items/:index/position/commit', (req, res) => {
    const listId = req.params.id
    const itemIndex = req.params.index
    const newIndex = req.body.new_index

    const item = todoListsItemsService.get(listId, itemIndex)

    if (item) {
        todoListsItemsService.modifyItemPosition(listId, itemIndex, newIndex)
        return res.status(201).json({status: "Successful commit: item modified"})
    } else {
        // TODO: Handle this scenario?
        return res.status(404).json({ 
            message: "Couldn't commit the item modification because the resource does not exist." 
        })
    }
})

/**
 * DELETE /lists/:id/items/:index/commit
 *  
 * Commits the item [index] deletion from the list that other instances verified. 
 * It also makes the list available after the change is made.
 * 
 */

 router.delete('/:id/items/:index/commit', (req, res) => {
    const listId = req.params.id
    const itemIndex = req.params.index

    const item = todoListsItemsService.get(listId, itemIndex)

    if (item) {
        todoListsItemsService.deleteItem(listId, itemIndex)
        return res.status(204).json({status: "Successful commit: item deleted"})
    } else {
        // TODO: Handle this scenario?
        return res.status(404).json({ 
            message: "Couldn't commit the item deletion because the resource does not exist." 
        })
    }
});

class TodoListsController {
    static handleResult(resultPromise, res) {
        resultPromise.then(result => {
            console.log("RESULT AT CONTROLLER", result);
            if (result.isOk)
                return res.json({list: result.list})
            else
                return res.status(409).json({message: result.message})
        })
    }
}

module.exports = router;
