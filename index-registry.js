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
app.use('/node', nodeController);

registryHealthCheckCron.start();