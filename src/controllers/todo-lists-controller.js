const express = require('express');
const ListsService = require("../services/todo-lists-service");
const router = express.Router()
const listsService = new ListsService()

// ---------------------- LIST ENDPOINTS ----------------------//

/**
 * POST /lists
 * { "items": [] }
 *
 * Creates a list.
 */
router.post('/', (req, res) => {
    const items = req.body.items
    TodoListsController.handleResult(listsService.createList(items), res)
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
    TodoListsController.handleResult(listsService.performAddItem(listId, item), res)
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
    TodoListsController.handleResult(listsService.performUpdateItem(listId, itemIndex, item), res)
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
    TodoListsController.handleResult(
        listsService.performUpdateItemReadyStatus(listId, itemIndex, ready), res
    )
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
    TodoListsController.handleResult(
        listsService.performUpdateItemPosition(listId, itemIndex, newIndex), res
    )
})

/**
 * DELETE /lists/:id/items/:index
 *
 * Deletes the item [index] from the list.
 */
 router.delete('/:id/items/:index', (req, res) => {
    const listId = req.params.id
    const itemIndex = req.params.index
    TodoListsController.handleResult(listsService.performDeleteItem(listId, itemIndex), res)
})

/**
 * PUT /lists/:id/commit
 * { "list" : [list] }
 * 
 * Commits the updated list that other instances verified on top of the previous list. 
 * It also makes the list available after the change is made.
 * 
 */
router.put('/:id/commit', (req, res) => {
    const listId = req.params.listId
    const updatedList = req.body.list

    const list = listsService.updateAndUnlockList(listId, updatedList)

    if (list) {
        console.log("Successful commit: list updated")
        return res.status(200).json({ list: updatedList })
    } else {
        return res.status(422).json({ message: "Couldn't commit the updated list." })
    }
});

class TodoListsController {
    static handleResult(resultPromise, res) {
        resultPromise.then(result => {
            if (result.isOk)
                result.list.then(list => { res.json({ list: list }) })
            else
                res.status(409).json({ message: result.message })
        })
    }
}

module.exports = router;
