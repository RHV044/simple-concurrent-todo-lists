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

    createList(elements) {
        return this.performAction(null, nodesToCommit => {
            // TODO HERE WE NEED TO MAKE THE CALL TO THE OTHER NODES AND RETURN THE LIST WITH THE APPLIED CHANGES
        })
    }

    addElement(listId, element) {
        return this.performAction(listId, nodesToCommit => {
            // TODO HERE WE NEED TO MAKE THE CALL TO THE OTHER NODES AND RETURN THE LIST WITH THE APPLIED CHANGES
        })
    }

    deleteElement(listId, index) {
        return this.performAction(listId, nodesToCommit => {
            // TODO HERE WE NEED TO MAKE THE CALL TO THE OTHER NODES AND RETURN THE LIST WITH THE APPLIED CHANGES
        })
    }

    markReadiness(listId, index, isReady) {
        return this.performAction(listId, nodesToCommit => {
            // TODO HERE WE NEED TO MAKE THE CALL TO THE OTHER NODES AND RETURN THE LIST WITH THE APPLIED CHANGES
        })
    }

    modifyElement(listId, index, item) {
        return this.performAction(listId, nodesToCommit => {
            // TODO HERE WE NEED TO MAKE THE CALL TO THE OTHER NODES AND RETURN THE LIST WITH THE APPLIED CHANGES
        })
    }

    moveElement(listId, index, newIndex) {
        return this.performAction(listId, nodesToCommit => {
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