const express = require('express');
const ListsService = require("../services/todo-lists-service");
const router = express.Router()
const listsService = new ListsService()
const {response} = require('express');

// TODO: Manejar los endpoints

// ----------------- COMMIT ENDPOINTS ------------------//

/**
 * POST /lists/:list_id/items/commit
 *
 * Commits the item creation that other instance verified. It also makes the list available after the change is made.
 * 
 */

 router.post('/commit', (req, res) => {
  const listId = req.params.listId
  const itemValue = req.params.itemValue

  const item = todoListsItemsService.addItem(listId, itemValue)

  if (item) {
    return res.status(201).json({status: "Successful commit: item created"})
  } else {
    // TODO: Handle this scenario?
    return res.status(404).json({ message: "Couldn't commit the item creation." })
  }
});

/**
 * PUT /lists/:list_id/items/:item_id/commit
 *
 * Commits the item modification that other instance verified. It also makes the list available after the change is made.
 * 
 */

 router.put('/:item_id/commit', (req, res) => {
  const listId = req.params.listId
  const itemId = req.params.itemId
  const itemValue = req.params.itemValue
  const itemStatus = req.params.itemStatus
  const itemOrder = req.params.itemOrder

  const item = todoListsItemsService.get(listId, itemId)

  if (item) {
    todoListsItemsService.modifyItem(listId, itemId, itemValue, itemStatus, itemOrder)
    return res.status(201).json({status: "Successful commit: item modified"})
  } else {
    // TODO: Handle this scenario?
    return res.status(404).json({ message: "Couldn't commit the item modification because the resource does not exist." })
  }
});

/**
 * DELETE /lists/:list_id/items/:item_id/commit
 *
 * Commits the item deletion that other instance verified. It also makes the list available after the change is made.
 * 
 */

 router.delete('/:item_id/commit', (req, res) => {
  const listId = req.params.listId
  const itemId = req.params.itemId

  const item = todoListsItemsService.get(listId, itemId)

  if (item) {
    todoListsItemsService.deleteItem(listId, itemId)
    return res.status(204).json({status: "Successful commit: item deleted"})
  } else {
    // TODO: Handle this scenario?
    return res.status(404).json({ message: "Couldn't commit the item deletion because the resource does not exist." })
  }
});

module.exports = router;
