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

    addItem(id, item) {
        return listRepository.addItem(id, item);
    }

    modifyItem(id, index, item) {
        return listRepository.modifyItem(id, index, item);
    }

    modifyItemReadyStatus(id, index, ready) {
        return listRepository.modifyItemReadyStatus(id, index, ready);
    }

    modifyItemPosition(id, index, newIndex) {
        return listRepository.modifyItemPosition(id, index, newIndex);
    }

    deleteItem(id, index) {
        return listRepository.deleteItem(id, index);
    }

    createList(items) {
        return this.performAction(null, nodesToCommit => {
            // TODO: Does this also call the commit action?
            // TODO HERE WE NEED TO MAKE THE CALL TO THE OTHER NODES AND RETURN THE LIST WITH THE APPLIED CHANGES
        })
    }

    // ---------------------- COMMIT SERVICES ----------------------//

    commitAddItem(listId, item) {
        return this.performAction(listId, nodesToCommit => {
            // We modify add the item locally
            const modifiedList = this.addItem(listId, item);
            // TODO: commit to the rest of the instances.
            // TODO: Then we proceed to unlock the list.
            // TODO HERE WE NEED TO MAKE THE CALL TO THE OTHER NODES AND RETURN THE LIST WITH THE APPLIED CHANGES
        })
    }

    commitModifyItem(listId, index, item) {
        return this.performAction(listId, nodesToCommit => {
            // We modify the item locally
            const modifiedList = this.modifyItem(listId, index, item);
            // TODO HERE WE NEED TO MAKE THE CALL TO THE OTHER NODES AND RETURN THE LIST WITH THE APPLIED CHANGES
        })
    }

    commitModifyItemReadyStatus(listId, index, isReady) {
        return this.performAction(listId, nodesToCommit => {
            // We modify the item ready status locally
            const modifiedList = this.modifyItemReadyStatus(listId, index, isReady);
            // TODO HERE WE NEED TO MAKE THE CALL TO THE OTHER NODES AND RETURN THE LIST WITH THE APPLIED CHANGES
        })
    }

    commitModifyItemPosition(listId, index, newIndex) {
        return this.performAction(listId, nodesToCommit => {
            // We modify the item position locally
            const modifiedList = this.modifyItemPosition(listId, index, newIndex);
            // TODO HERE WE NEED TO MAKE THE CALL TO THE OTHER NODES AND RETURN THE LIST WITH THE APPLIED CHANGES
        })
    }

    commitDeleteItem(listId, index) {
        return this.performAction(listId, nodesToCommit => {
            // We delete the item locally
            const modifiedList = this.deleteItem(listId, index)
            // TODO HERE WE NEED TO MAKE THE CALL TO THE OTHER NODES AND RETURN THE LIST WITH THE APPLIED CHANGES
        })
    }

    performAction(id, action) {
        if (id == null) return Promise.resolve(this.ok(action(nodesService.getAllButSelf())));
        // if id == null that means it is a creation and there is no need to check for availability.

        return this.checkAvailability(id).then(quorumAvailability => {
            if (quorumAvailability.hasQuorum)
                return this.ok(action(quorumAvailability.nodesSaidYes))
            else
                return {
                    isOk: false,
                    message: "Unable to modify list because is being modified by another user"
                }
        })
    }

    ok(list) {
        return {
            isOk: true,
            list: [] // TODO: return the list with the action performed
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
                Utils.log(`Error checking availability on node ${node} for list ${listId}`, error.response.data);
                return {isAvailable: false, node: node} // TODO: Check if we want to retry.
            })
    }
}

module.exports = TodoListsService;