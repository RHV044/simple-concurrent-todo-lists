const {default: axios} = require('axios');
const TodoListRepository = require('../repositories/todo-list-repository')
const NodesService = require("./nodes-service");
const listRepository = new TodoListRepository([]) // TODO: receive lists when starting the app and send it to repository
const nodesService = new NodesService()
const Utils = require('../utils');

class TodoListsService {

    // ---------------------- REPOSITORY SERVICES ----------------------//

    checkAndSetAvailability(id) {
        return listRepository.checkAndSetAvailability(id);
    }

    createList(list) {
        return listRepository.createList(list);
    }

    getList(id) {
        return listRepository.getList(id)
    }

    updateAndUnlockList(id, list) {
        listRepository.updateList(id, list);
        listRepository.checkAndSetAvailability(id, true);
    }

    addItem(id, item) {
        return listRepository.addItem(id, item);
    }

    updateItemText(id, index, text) {
        return listRepository.updateItemText(id, index, text);
    }

    updateItemDoneStatus(id, index, ready) {
        return listRepository.updateItemDoneStatus(id, index, ready);
    }

    updateItemPosition(id, index, newIndex) {
        return listRepository.updateItemPosition(id, index, newIndex);
    }

    deleteItem(id, index) {
        return listRepository.deleteItem(id, index);
    }

    // ---------------------- COMMIT SERVICES ----------------------//

    performCreateList(newList) {
        // For the list creation we make a commit without quorum.

        let createdList = this.createList(newList);
        let nodes = nodesService.getAllButSelf();

        // We give a null listId to call the list creation endpoint.
        let list = this.commitToNodes(nodes, null, createdList);

        return this.ok(list);
    }

    performAddItem(listId, item) {
        return this.performAction(listId, _ => {
            // We add the item locally
            return this.addItem(listId, item);
        })
    }

    performUpdateItem(listId, index, text) {
        return this.performAction(listId, _ => {
            // We update the text locally
            return this.updateItemText(listId, index, text);
        })
    }

    performUpdateItemDoneStatus(listId, index, isDone) {
        return this.performAction(listId, _ => {
            // We update the item ready status locally
            return this.updateItemDoneStatus(listId, index, isDone);
        })
    }

    performUpdateItemPosition(listId, index, newIndex) {
        return this.performAction(listId, _ => {
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
                let updatedList = action()

                // After we updated the local list, we commit the change to the nodes that agreed 
                // with the new change. Also, we unlock the list locally.
                let list = this.commitToNodes(quorumAvailability.nodesSaidYes, id, updatedList)

                return this.ok(list)
            }
            else
                // Could not update to cluster. Proceed to update local list.
                var todoLists = nodesService.getAllButSelf().map(node => {
                    return axios.get(`${Utils.getUrlForPort(node)}/lists/${id}`)
                })

                Promise.all(todoLists)
                    .then(todoLists => {
                        var groupedLists = Utils.groupBy(todoLists.map(todoList => {return todoList.data}), "title")
                        var quorumList = Object.entries(groupedLists).sort((a, b) => {a[1].length < b[1].length})[0][1][0]
                        listRepository.updateToDoList(id, quorumList)
                    })

                return {
                    isOk: false,
                    message: "Unable to update list because is being modified by another user"
                }
        })
    }

    commitToNodes(nodes, id, list) {
        let committedListsToNodes = nodes.map(node => this.commitList(node, id, list))

        return Promise.all(committedListsToNodes)
            .then(_ => {
                // We unlock the list locally and return the updated list
                if (id) listRepository.checkAndSetAvailability(id, true);
                return list;
            })
            .catch(_ => { return list })
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
                return { isAvailable: response.data.isAvailable, node: node }
            })
            .catch(error => {
                Utils.log(`Error checking availability on node ${node} for list ${listId}`, 
                          error.response.data);
                return { isAvailable: false, node: node } // TODO: Check if we want to retry.
            })
    }

    commitList(node, listId, list) {
        // If the listId is present, then we update a current list, if not, then we create it.
        if(listId) {
            return axios.put(`${Utils.getUrlForPort(node)}/lists/${listId}/commit`, { list: list })
                .catch(error => {
                    Utils.log(`Error commiting updated list on node ${node} for list ${listId}`, 
                            error.response.data);
                })
        }
        return axios.post(`${Utils.getUrlForPort(node)}/lists/commit`, { list: list })
            .catch(error => {
                Utils.log(`Error commiting the list creation on node ${node}`, error.response.data);
            })
    }
}

module.exports = TodoListsService;
