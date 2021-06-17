const express = require('express');
const app = new express();
const nodeController = require('./src/controllers/nodes-controller');
const RegistryHealthCheckCron = require('./src/crons/registry-health-check-cron');
const registryHealthCheckCron = new RegistryHealthCheckCron();
const Config = require('./src/config');

Config.setIsRegistry(true);

app.listen(Config.getRegistryPort(), () => {
    console.log(`Listening on port ${Config.getRegistryPort()}`);
});

app.use(express.json());
app.use('/node', nodeController);

registryHealthCheckCron.start();