const express = require('express');
const router = express.Router();

router.get('/ping', (_, res) => {
    const { value, info } = require('../services/scrapService').state;
    res.json({ value, info });
});