const axios = require('axios')
const Utils = require('../utils')
const Config = require('../config');
const ClusterPortsRepository = require('../repositories/cluster-ports-repository')
const TodoListsService = require('../services/todo-lists-service')  

class NodeInitializerService {

    static init(port = Config.selfPort, onComplete = (_) => {}) {
        axios
            .post(`${Utils.getUrlForPort(Config.getRegistryPort())}/node`, { port: port })
            .then(
                (response) => {
                    ClusterPortsRepository.getInstance().set(response.data.ports)
                    Utils.log(`Success initialization on registry. Available nodes are: ${ClusterPortsRepository.getInstance().list()}`)
                    Utils.log('Proceeding to update node with all available TodoLists...')
                    new TodoListsService().fetchAllListsByQuorum()
                    onComplete(true)
                },
                (error) => {
                    if (error.data) Utils.log(error.data)
                    onComplete(false)
                }
            )
    }
}

module.exports = NodeInitializerService