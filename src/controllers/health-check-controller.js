const express = require('express');
const router = express.Router();

let isUp = true;

/**
 * GET /health-check
 * 
 * A simple endpoint to verify if the node is up.
 */
router.get('/', (_, res) => {
    if (isUp) {
        return res.json({ status: 'UP' });
    } else {
        return res.status(404).send();
    }
});

/**
 * POST /health-check/teadown
 * { timeout: 3000 } 
 * 
 * Simulates that the node is down for the given timeout in ms.
 */
router.post('/teardown', (req, res) => {
    isUp = false;
    setTimeout(() => isUp = true, req.body.timeout);
    return res.json({});
});

module.exports = router;