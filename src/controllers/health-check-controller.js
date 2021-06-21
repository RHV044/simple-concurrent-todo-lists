const express = require('express');
const router = express.Router();

let isUp = true;

/**
 * GET /
 * 
 * A simple endpoint to verify if the node is up.
 */
router.get('/', (_, res) => {
    console.log(`Is up: ${isUp}`);
    if (isUp) {
        return res.json({ status: 'UP' });
    } else {
        return res.status(404).send();
    }
});

/**
 * POST /teadown
 * { timeout: 3000 } 
 * 
 * Simulates that the node is down for the given timeout in ms.
 */
router.post('/teardown', (req, res) => {
    isUp = false;
    console.log(`Set is up: ${isUp}`);
    setTimeout(() => {
        isUp = true;
        console.log(`Set is up: ${isUp}`);
    }, req.body.timeout);
    return res.json({});
});

module.exports = router;