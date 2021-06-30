const express = require('express');
const ListsService = require("../services/todo-lists-service");
const router = express.Router()
const listsService = new ListsService()

// ---------------------- LIST ENDPOINTS ----------------------//

/**
 * GET /lists
 *
 * Returns all the lists.
 */
router.get('/', (_, res) => res.json(listsService.get()));

/**
 * POST /lists
 * {
 *   "list": {
 *       "title": "Things to do",
 *       "creator": "Pepe"
 *   }
 * }
 *
 * Creates a list.
 */
router.post('/', (req, res) => {
    const list = req.body.list

    const result = listsService.performCreateList(list)

    result.list.then(list => {
        if (list)
            res.status(201).json(list)
        else
            res.status(422).json({ message: "Couldn't create the list." })
    })
})

/**
 * PATCH /lists/:id/availability
 *
 * Returns whether the list is available and then blocks it.
 */
router.patch('/:id/availability', (req, res) => {
    return res.json({ isAvailable: listsService.checkAndSetAvailability(req.params.id) })
});


/**
 * POST /lists/:id/items
 * {
 *  "item": {
 *   "text": "do homework",
 *   "done": false
 *  }
 * }
 *
 * Adds an item to a list.
 */
router.post('/:id/items', (req, res) => {
    const listHash = req.headers['X-List-Hash']
    const listId = req.params.id
    const item = req.body.item

    TodoListsController.handleResult(
        listsService.performAddItem(listHash, listId, item),
        res
    )
})

/**
 * PUT /lists/:id/items/:index
 * { "text": "take a shower" }
 *
 * Updates the item [index]'s text with the given.
 */
router.put('/:id/items/:index', (req, res) => {
    const listHash = req.headers['X-List-Hash']
    const listId = req.params.id
    const itemIndex = req.params.index
    const text = req.body.text

    TodoListsController.handleResult(
        listsService.performUpdateItem(listHash, listId, itemIndex, text), 
        res
    )
})

/**
 * PATCH /lists/:id/items/:index/done?status=:status
 *
 * Changes the item [index] done status from the list as [status].
 */
router.patch('/:id/items/:index/done', (req, res) => {
    const listHash = req.headers['X-List-Hash']
    const listId = req.params.id
    const itemIndex = req.params.index
    const done = req.query.status

    TodoListsController.handleResult(
        listsService.performUpdateItemDoneStatus(listId, itemIndex, done), 
        res
    )
})

/**
 * PATCH /lists/:id/items/:index/position
 * { "new_index": 4 }
 *
 * Moves the item [index] to the new index.
 */
router.patch('/:id/items/:index/position', (req, res) => {
    const listHash = req.headers['X-List-Hash']
    const listId = req.params.id
    const itemIndex = req.params.index
    const newIndex = req.body.new_index

    TodoListsController.handleResult(
        listsService.performUpdateItemPosition(listHash, listId, itemIndex, newIndex), 
        res
    )
})

/**
 * DELETE /lists/:id/items/:index
 *
 * Deletes the item [index] from the list.
 */
router.delete('/:id/items/:index', (req, res) => {
    const listHash = req.headers['X-List-Hash']
    const listId = req.params.id
    const itemIndex = req.params.index

    TodoListsController.handleResult(
        listsService.performDeleteItem(listHash, listId, itemIndex), 
        res
    )
})

// ---------------------- COMMIT ENDPOINTS ----------------------//

/**
 * POST /lists/commit
 * { "list" : [list] }
 *
 * Commits the created list to the other instances.
 *
 */
router.post('/commit', (req, res) => {
    const newList = req.body.list

    const list = listsService.createList(newList)

    if (list) {
        console.log("Successful commit: list created")
        res.status(204).send()
    } else {
        res.status(422).json({ message: "Couldn't commit the created list." })
    }
});

/**
 * PUT /lists/:id/commit
 * { "list" : [list] }
 *
 * Commits the updated list that other instances verified on top of the previous list.
 * It also makes the list available after the change is made.
 *
 */
router.put('/:id/commit', (req, res) => {
    const listId = req.params.id
    const updatedList = req.body.list

    listsService.updateAndUnlockList(listId, updatedList)
    console.log("Successful commit: list updated")
    res.status(204).send()
});

class TodoListsController {
    static handleResult(resultPromise, res) {
        resultPromise.then(result => {
            if (result.isOk)
                res.json({ list: result.list })
            else
                res.status(409).json({ message: result.message })
        })
    }
}

module.exports = router;
