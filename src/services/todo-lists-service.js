const { default: axios } = require('axios');
const TodoListRepository = require('../repositories/todo-list-repository')
const NodesService = require("./nodes-service");
const listRepository = TodoListRepository.getInstance()
const nodesService = new NodesService()
const Utils = require('../utils');

class TodoListsService {

    // ---------------------- REPOSITORY SERVICES ----------------------//

    get() {
        return listRepository.get();
    }

    checkAndSetAvailability(id) {
        return listRepository.checkAndSetAvailability(id);
    }

    createList(list) {
        return listRepository.createList(list);
    }

    fetchAllListsByQuorum() {
        const allListsResponse = Utils.flatMap(nodesService.getAllButSelf(), node => {
            return axios.get(Utils.getUrlForPort(node) + '/lists');
        })

        Promise.all(allListsResponse)
            .then(allListsResponse => {
                var allLists = Utils.flatMap(allListsResponse, response => { return response.data })

                listRepository.addAll(

                    /**
                     * filter any possibly null list from the data, group all lists by their ID,
                     * then return the quorumed list for each group
                     */
                    Object.values(Utils.groupBy(allLists.filter(list => { return list != null }), "id"))
                        .map(toDoLists => { return this.getQuorumList(toDoLists) })
                    // TODO: how to handle? .filter(toDoList => {toDoList != undefined})
                )

                Utils.log('Current lists are: ' + this.get().map(list => { return list.title }));
            })
            .catch(error => {
                Utils.log('Error fetching lists from a node: ' + error, error)
            })
    }

    getList(id) {
        return listRepository.findList(id)
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

    performAddItem(listHash, listId, item) {
        return this.performAction(listHash, listId, _ => {
            // We add the item locally
            return this.addItem(listId, item);
        })
    }

    performUpdateItem(listHash, listId, index, text) {
        return this.performAction(listHash, listId, _ => {
            // We update the text locally
            return this.updateItemText(listId, index, text);
        })
    }

    performUpdateItemDoneStatus(listHash, listId, index, isDone) {
        return this.performAction(listHash, listId, _ => {
            // We update the item ready status locally
            return this.updateItemDoneStatus(listId, index, isDone);
        })
    }

    performUpdateItemPosition(listHash, listId, index, newIndex) {
        return this.performAction(listHash, listId, _ => {
            // We update the item position locally
            return this.updateItemPosition(listId, index, newIndex);
        })
    }

    performDeleteItem(listHash, listId, index) {
        return this.performAction(listHash, listId, _ => {
            // We delete the item locally
            return this.deleteItem(listId, index);
        })
    }

    performAction(hash, id, action) {
        // Check the list hash version for front-end concurrency conflicts
        let todoList = listRepository.findList(id)
        if (Utils.generateListHash(todoList.list) != hash) {
            Utils.log("Error updating the list, invalid list hash version")
            return Promise.resolve(this.error("Unable to update list because it's an older version. Please reload the page."))
        }

        return this.checkAvailability(id).then(quorumAvailability => {
            if (quorumAvailability.hasQuorum) {
                // Apply the action to the list locally
                let updatedTodoList = action()

                // After we updated the local list, we commit the change to the nodes that agreed 
                // with the new change. Also, we unlock the list locally.
                return this.commitToNodes(quorumAvailability.nodesSaidYes, id, updatedTodoList.list)
                    .then((updatedList) => {
                        updatedTodoList.list = updatedList
                        return this.ok(updatedTodoList)
                    })
            }
            else {
                Utils.log(`Could not update list ${id} to cluster. Will update local list`);

                var todoListsResponse = nodesService.getAllButSelf().map(node => {
                    return axios.get(`${Utils.getUrlForPort(node)}/lists/${id}`)
                })

                Promise.all(todoListsResponse)
                    .then(todoListsResponse => {
                        var todoLists = todoListsResponse.map(todoList => { return todoList.data })
                        var quorumList = this.getQuorumList(todoLists)

                        if (!quorumList)
                            throw `No quorum achieved for list ${id}!`

                        listRepository.updateToDoList(id, quorumList)
                    })
                    .catch(error => {
                        Utils.log(`Error reading from quorum for list ${id}`, error && error.response && error.response.data)
                    })

                return {
                    isOk: false,
                    message: "Unable to update list because is being modified by another user"
                }
            }
        })
    }

    requiredQuorum(isRead = false) {
        const nodes = isRead ? nodesService.getAllButSelf() : nodesService.get()

        return Math.floor(nodes.length / 2)
    }

    getQuorumList(todoLists) {
        todoLists.forEach((todoList) => {
            todoList.hash = Utils.generateListHash(todoList.list)
        });
        var groupedTodoLists = Utils.groupBy(todoLists, "hash")

        var listByQuorum = Object.values(groupedTodoLists)
            .filter(todoList => { return todoList.length >= this.requiredQuorum(true) + 1 })

        if (listByQuorum.length)
            return listByQuorum[0][0]
        else
            return undefined
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

    error(message) {
        return {
            isOk: false,
            message: message
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
            if (checkNodesAvailability.length == 0) {
                return Promise.resolve({
                    hasQuorum: true,
                    nodesSaidYes: []
                });
            }

            return Promise.all(checkNodesAvailability)
                .then(responses => responses.filter(response => response.isAvailable).map(response => response.node))
                .then(nodesAvailable => {
                    return {
                        hasQuorum: nodesAvailable.length >= this.requiredQuorum(),
                        nodesSaidYes: nodesAvailable
                    }
                });
        }
        return Promise.resolve({
            hasQuorum: false,
            nodesSaidYes: []
        });
    }

    askAvailability(node, listId, retriesOnFailure = 3) {
        return axios.patch(`${Utils.getUrlForPort(node)}/lists/${listId}/availability`)
            .then(response => {

                return { isAvailable: response.data && response.data.isAvailable, node: node }

            })
            .catch(async error => {

                if (retriesOnFailure === 0) {
                    Utils.log(`Error checking availability on node ${node} for list ${listId}`,
                        error && error.response && error.response.data);
                    Utils.log(`No retries left.`);
                    return { isAvailable: false, node: node }
                }
                else {
                    Utils.log(`Error checking availability on node ${node} for list ${listId}`, error && error.response && error.response.data);
                    Utils.log(`Retrying again in 5 seconds. ${retriesOnFailure} retries left`);
                    await new Promise(tick => setTimeout(tick, 5000))
                    Utils.log(`Retrying...`);
                    var retries = retriesOnFailure - 1;
                    return this.askAvailability(node, listId, retries);
                }

            })
    }

    commitList(node, listId, list) {
        // If the listId is present, then we update a current list, if not, then we create it.
        if (listId) {
            return axios.put(`${Utils.getUrlForPort(node)}/lists/${listId}/commit`, { list: list })
                .catch(error => {
                    Utils.log(`Error commiting updated list on node ${node} for list ${listId}`,
                        error && error.response && error.response.data);
                })
        }
        return axios.post(`${Utils.getUrlForPort(node)}/lists/commit`, { list: list })
            .catch(error => {
                Utils.log(`Error commiting the list creation on node ${node}`, error && error.response && error.response.data);
            })
    }
}

module.exports = TodoListsService;
