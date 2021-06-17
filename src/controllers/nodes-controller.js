const { default: axios } = require('axios');
const express = require('express');
const ClusterPortsRepository = require('../repositories/cluster-ports-repository');
const Utils = require('../utils');
const Config = require('../config');
const router = express.Router();

router.get('/', (req, res) => {
    return res.json({ status: 'ok', ports: ClusterPortsRepository.getInstance().list() });
});

router.post('/', (req, res) => {
    let port = req.body.port;

    // If it's the registry then we should let know the nodes that a new port is available.
    if (Config.isRegistry) {
        ClusterPortsRepository.getInstance().list().forEach(availablePort => {
            axios.post(Utils.getUrlForPort(availablePort), { port: port });
        });
    }

    // Add the port to the repository
    ClusterPortsRepository.getInstance().add(port);
    let availablePorts = ClusterPortsRepository.getInstance().list();
    console.log(`Added port ${port}, then available ports are: ${availablePorts}`);

    // Return the available ports
    return res.json({ status: 'ok', ports: availablePorts });
});

router.delete('/', (req, res) => {
    let port = req.body.port;

    // If it's the registry then we should let know the nodes that the port is not more available.
    if (Config.isRegistry) {
        ClusterPortsRepository.getInstance().list().forEach(availablePort => {
            axios.delete(Utils.getUrlForPort(availablePort), { port: port });
        });
    }

    // Remove the port from the list
    ClusterPortsRepository.getInstance().remove(port);
    console.log(`Removed port ${port}, then available ports are: ${ClusterPortsRepository.getInstance().list()}`)

    // Return a success answer
    return res.json({ status: 'ok' });
});

module.exports = router;