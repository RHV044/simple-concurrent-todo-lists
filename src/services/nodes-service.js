const { default: axios } = require('axios');
const ClusterPortsRepository = require('../repositories/cluster-ports-repository');
const Utils = require('../utils');
const Config = require('../config');

class NodesService {

    get() {
        return ClusterPortsRepository.getInstance().list();
    }

    getAllButSelf() {
        console.log("SELF", Config.selfPort)
        return this.get().filter(node => node !== Config.selfPort)
    }

    add(port) {
        // If it's the registry then we should let know the nodes that a new port is available.
        if (Config.isRegistry) {
            ClusterPortsRepository.getInstance().list().forEach(availablePort => {
                axios.post(`${Utils.getUrlForPort(availablePort)}/node`, { port: port });
            });
        }

        // Add the port to the repository
        ClusterPortsRepository.getInstance().add(port);
        const availablePorts = ClusterPortsRepository.getInstance().list();
        Utils.log(`Added port ${port}, then available ports are: ${availablePorts}`);

        return availablePorts;
    }

    delete(port) {
        // Remove the port from the list
        ClusterPortsRepository.getInstance().remove(port);
        Utils.log(`Removed port ${port}, then available ports are: ${ClusterPortsRepository.getInstance().list()}`)

        // If it's the registry then we should let know the nodes that the port is not more available.
        if (Config.isRegistry) {
            ClusterPortsRepository.getInstance().list().forEach(availablePort => {
                axios.delete(`${Utils.getUrlForPort(availablePort)}/node/${port}`);
            });
        }
    }
}

module.exports = NodesService;