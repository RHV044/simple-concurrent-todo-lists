const express = require('express');
const app = new express();
const nodeController = require('./src/controllers/nodes-controller');
const RegistryHealthCheckCron = require('./src/crons/registry-health-check-cron');
const registryHealthCheckCron = new RegistryHealthCheckCron();
const Config = require('./src/config');
const Utils = require('./src/utils');

Config.setIsRegistry(true);

app.listen(Config.getRegistryPort(), () => {
    Utils.log(`Listening on port ${Config.getRegistryPort()}`);
});

app.use(express.json());
// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
app.use('/node', nodeController);

registryHealthCheckCron.start();