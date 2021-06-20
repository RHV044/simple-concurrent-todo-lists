const {default: axios} = require('axios');
const TodoListRepository = require('../repositories/todo-list-repository')
const NodesService = require("./nodes-service");
const listRepository = new TodoListRepository([]) // TODO: receive lists when starting the app and send it to repository
const nodesService = new NodesService()
const Utils = require('../utils');

class TodoListsService {

    constructor() {
        /** Contains the action being performed for a list id */
        this.performingActions = new Map();
    }

    performAction(id, action) {
        if (listRepository.checkAndSetAvailability(id)) {
            this.performingActions.set(id, action);
            let checkNodesAvailability = nodesService.get().map(node => this.askAvailability(node, id));
            const nodesAvailabilities = Promise.all(checkNodesAvailability)
                .then(responses => responses.map(response => response.isAvailable));
            
            // TODO: Check if there is quorum and then commit the action for every node.

            return {
                isOk: true,
                list: [] // TODO: return the list with te action performed
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

    askAvailability(node, listId) {
        return axios.patch(`${Utils.getBaseUrlForPort(node)}/lists/${listId}/availability`)
            .then(response => response.data)
            .catch(error => {
                console.log(`Error checking availability on node ${node} for list ${listId}`, error.response.data);
                return {"isAvailable": false} // TODO: Check if we want to retry.
            })
    }
}

module.exports = TodoListsService;