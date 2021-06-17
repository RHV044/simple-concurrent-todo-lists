const express = require('express');
const ClusterPortsRepository = require('../repositories/cluster-ports-repository');
const router = express.Router();
const clusterPortsRepository = new ClusterPortsRepository();

router.get('/', (req, res) => {
    return res.json({ status: 'ok', ports: clusterPortsRepository.list() });
});

router.post('/', (req, res) => {
    let port = req.body.port;
    clusterPortsRepository.add(port);
    return res.json({ status: 'ok' });
});

router.delete('/', (req, res) => {
    let port = req.body.port;
    clusterPortsRepository.remove(port);
    return res.json({ status: 'ok' });
});

module.exports = router;