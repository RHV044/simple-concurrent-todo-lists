const express = require('express');
const NodesService = require('../services/nodes-service');
const nodesService = new NodesService();
const router = express.Router();

/** 
 * GET /node
 * 
 * Returns all the available nodes ports.
 */
router.get('/', (req, res) => {
    return res.json({ status: 'ok', ports: nodesService.get() });
});

/** 
 * POST /node 
 * { port: 8000 }
 * 
 * Creates a new node on the given port.
 */
router.post('/', (req, res) => {
    return res.json({ status: 'ok', ports: nodesService.add(req.body.port) });
});


/** 
 * DELETE /node/8000 
 * 
 * Deletes the node with the given port.
 */
router.delete('/:port', (req, res) => {
    nodesService.delete(req.params.port);
    return res.json({ status: 'ok' });
});

module.exports = router;