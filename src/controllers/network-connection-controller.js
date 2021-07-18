const express = require('express');
const router = express.Router();
const Utils = require('../utils');
const Config = require('../config');
const simulate = require('simulate-network-conditions') 
const axios = require('axios');

/** 
 * POST /connection/lost 
 * { time: 3000 }
 * 
 * Simulates a connection lost for given time in ms.
 */
router.post('/lost', (req, res) => {
    Utils.log(`Simulates connection lost for ${req.body.time}ms.`)
    Config.setHasInternet(false)
    setTimeout(() => {
        Utils.log("Connection recovered")
        Config.setHasInternet(true)
    }, req.body.time)
    return res.json({ status: 'ok' });
});

module.exports = router;