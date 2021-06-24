const {default: axios} = require('axios');
const TodoListRepository = require('../repositories/todo-list-repository')
const NodesService = require("./nodes-service");
const listRepository = new TodoListRepository([]) // TODO: receive lists when starting the app and send it to repository
const nodesService = new NodesService()
const Utils = require('../utils');

class TodoListsService {

    performAction(id, action) {
        if (id == null || this.checkAvailability(id)) {
            // if id == null that means it is a creation and there is no need to check for availability.

            /* TODO: Commit the action for every node.

            switch(action.type) {
                case "CREATE_LIST": action.elements
                case "DELETE": actions.index
            } 
            */

            return {
                isOk: true,
                list: [] // TODO: return the list with the action performed
            }
        } else {
            return {
                isOk: false,
                message: "Unable to modify list because is being modified by another user"
            }
        }
    }

    checkAndSetAvailability(id) {
        return listRepository.checkAndSetAvailability(id);
    }

    /** Returns if the required list is available in this node and if there is quorum for the other nodes.
     * Examples:
     * nodesService.get().length returns:
     * - 5: requiredQuorum will be 2, that means that from the 4 nodes asked 2 need to be available.
     * - 4: requiredQuorum will also be 2. From the 3 nodes asked, 2 need to be available.
     * - 3: requiredQuorum will be 1. 1 of the 2 nodes asked needs to be available, then adding up self it reaches the majority.
     * */
    checkAvailability(id) {
        if (listRepository.checkAndSetAvailability(id)) {
            let checkNodesAvailability = nodesService.getAllButSelf().map(node => this.askAvailability(node, id));
            const nodesAvailabilitiesCount = Promise.all(checkNodesAvailability)
                .then(responses => responses.map(response => response.isAvailable))
                .then(booleans => booleans.filter(boolean => boolean).length);
            const requiredQuorum = Math.floor(nodesService.get().length / 2)

            return nodesAvailabilitiesCount >= requiredQuorum;
        }
        return false;
    }

    askAvailability(node, listId) {
        return axios.patch(`${Utils.getUrlForPort(node)}/lists/${listId}/availability`)
            .then(response => response.data)
            .catch(error => {
                Utils.log(`Error checking availability on node ${node} for list ${listId}`, error.response.data);
                return {"isAvailable": false} // TODO: Check if we want to retry.
            })
    }
}

module.exports = TodoListsService;