const {default: axios} = require('axios');
const TodoListRepository = require('../repositories/todo-list-repository')
const NodesService = require("./nodes-service");
const listRepository = new TodoListRepository([]) // TODO: receive lists when starting the app and send it to repository
const nodesService = new NodesService()
const Utils = require('../utils');

class TodoListsService {

    checkAndSetAvailability(id) {
        return listRepository.checkAndSetAvailability(id);
    }

    updateAndUnlockList(id, list) {
        let updatedList = listRepository.updateList(id, list);
        listRepository.checkAndSetAvailability(id, true);
        return updatedList;
    }

    addItem(id, item) {
        return listRepository.addItem(id, item);
    }

    updateItem(id, index, item) {
        return listRepository.updateItem(id, index, item);
    }

    updateItemReadyStatus(id, index, ready) {
        return listRepository.updateItemReadyStatus(id, index, ready);
    }

    updateItemPosition(id, index, newIndex) {
        return listRepository.updateItemPosition(id, index, newIndex);
    }

    deleteItem(id, index) {
        return listRepository.deleteItem(id, index);
    }

    createList(items) {
        return this.performAction(null, nodesToCommit => {
            // TODO: Does this also call the commit action? Es un commit sin quorum
            // TODO HERE WE NEED TO MAKE THE CALL TO THE OTHER NODES AND RETURN THE LIST WITH THE APPLIED CHANGES
        })
    }

    // ---------------------- COMMIT SERVICES ----------------------//

    performAddItem(listId, item) {
        return this.performAction(listId, nodesToCommit => {
            // We add the item locally
            return this.addItem(listId, item);
        })
    }

    performUpdateItem(listId, index, item) {
        return this.performAction(listId, nodesToCommit => {
            // We update the item locally
            return this.updateItem(listId, index, item);
        })
    }

    performUpdateItemReadyStatus(listId, index, isReady) {
        return this.performAction(listId, nodesToCommit => {
            // We update the item ready status locally
            return this.updateItemReadyStatus(listId, index, isReady);
        })
    }

    performUpdateItemPosition(listId, index, newIndex) {
        return this.performAction(listId, nodesToCommit => {
            // We update the item position locally
            return this.updateItemPosition(listId, index, newIndex);
        })
    }

    performDeleteItem(listId, index) {
        return this.performAction(listId, _ => {
            // We delete the item locally
            return this.deleteItem(listId, index);
        })
    }

    performAction(id, action) {
        // If the id is null, it means it is a creation and there is no need to check for availability.
        if (id == null) return Promise.resolve(this.ok(action(nodesService.getAllButSelf())));

        return this.checkAvailability(id).then(quorumAvailability => {
            if (quorumAvailability.hasQuorum) {
                // Apply the action to the list locally
                updatedList = action()

                // After we updated the local list, we commit the change to the nodes that agreed with the new change
                let committedListsToNodes = quorumAvailability.nodesSaidYes.map(node => 
                    this.commitUpdatedList(node, listId, updatedList)
                )

                let list = Promise.all(committedListsToNodes)
                    .then(_ => {
                        // Lastly, we unlock the list locally and return the updated list
                        listRepository.checkAndSetAvailability(listId, true);
                        return { list: updatedList };
                    })
                    .catch(_ => { return { list: updatedList }; })

                return this.ok(list)
            }
            else
                return {
                    isOk: false,
                    message: "Unable to update list because is being modified by another user"
                }
        })
    }

    ok(list) {
        return {
            isOk: true,
            list: list
        }
    }

    /** Returns a Promise containing a boolean that says if the required list is available in this node and if there is quorum for the other nodes,
     * and the nodes who said yes and need the commit.
     * Examples:
     * nodesService.get().length returns:
     * - 5: requiredQuorum will be 2, that means that from the 4 nodes asked 2 need to be available.
     * - 4: requiredQuorum will also be 2. From the 3 nodes asked, 2 need to be available.
     * - 3: requiredQuorum will be 1. 1 of the 2 nodes asked needs to be available, then adding up self it reaches the majority.
     * */
    checkAvailability(id) {
        if (listRepository.checkAndSetAvailability(id)) {
            let checkNodesAvailability = nodesService.getAllButSelf().map(node => this.askAvailability(node, id));
            const requiredQuorum = Math.floor(nodesService.get().length / 2)
            return Promise.all(checkNodesAvailability)
                .then(responses => responses.filter(response => response.isAvailable).map(response => response.node))
                .then(nodesAvailable => {
                    return {
                        hasQuorum: nodesAvailable.length >= requiredQuorum,
                        nodesSaidYes: nodesAvailable
                    }
                });
        }
        return Promise.resolve({
            hasQuorum: false,
            nodesSaidYes: []
        });
    }

    askAvailability(node, listId) {
        return axios.patch(`${Utils.getUrlForPort(node)}/lists/${listId}/availability`)
            .then(response => {
                return {isAvailable: response.data.isAvailable, node: node}
            })
            .catch(error => {
                Utils.log(`Error checking availability on node ${node} for list ${listId}`, 
                          error.response.data);
                return {isAvailable: false, node: node} // TODO: Check if we want to retry.
            })
    }

    commitUpdatedList(node, listId, updatedList) {
        return axios.put(`${Utils.getUrlForPort(node)}/lists/${listId}/commit`)
            .then(response => {
                return {list: response.data.list, node: node}
            })
            .catch(error => {
                Utils.log(`Error commiting updated list on node ${node} for list ${listId}`, 
                          error.response.data);
                return {list: null, node: node}
            })
    }
}

module.exports = TodoListsService;