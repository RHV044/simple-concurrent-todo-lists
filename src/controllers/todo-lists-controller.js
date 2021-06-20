const express = require('express');
const ListsService = require("../services/todo-lists-service");
const router = express.Router()
const listsService = new ListsService()
const {default: axios} = require('axios');
const {response} = require('express');

/**
 * POST /lists/:id
 * { "action": { "type": "DELETE", "element": 2 } }
 *
 * Performs any action in a list if possible. Returns the modified list or an error message.
 */
router.post('/:id', (req, res) => {
    const listId = req.params.id
    const action = req.body.action
    const result = listsService.performAction(listId, action)

    if (result.isOk)
        res.status.json( { list: result.list } )
    else
        res.status(409).json({ message: result.message });
});

/**
 * GET /lists/:id/availability
 *
 * Returns whether the list is available or blocked.
 */
router.get('/:id/availability', (req, res) => {
    res.json({ isAvailable: listsService.checkAndSetAvailability(req.params.id) })
})


module.exports = router;