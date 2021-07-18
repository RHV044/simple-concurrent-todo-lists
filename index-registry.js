const { default: axios } = require('axios');
const express = require('express');
const app = new express();
const nodeController = require('./src/controllers/nodes-controller');
const RegistryHealthCheckCron = require('./src/crons/registry-health-check-cron');
const registryHealthCheckCron = new RegistryHealthCheckCron();
const networkController = require('./src/controllers/network-connection-controller');
const Config = require('./src/config');
const Utils = require('./src/utils');

Config.setIsRegistry(true);

app.listen(Config.getRegistryPort(), () => {
    Utils.log(`Listening on port ${Config.getRegistryPort()}`);
});

// Interceptor for simulates internet connection
app.use(function(req, res, next) {
  if (!Config.hasInternet) {
    Utils.log(`Simulates error for incoming request: ${req.method} ${req.url}`)
    res.status(404).send();
  } else {
    next();
  }
});
axios.interceptors.request.use(req => {
    if (!Config.hasInternet) {
        Utils.log(`Simulates error for outcoming request: ${req.method} ${req.url}`)
        const mockError = new Error()
        mockError.mockData = mocks[req.url]
        mockError.config = req
        return Promise.reject(mockError)
    }
    // Important: request interceptors **must** return the request.
    return req;
});
Config.setHasInternet(true)

app.use(express.json());
// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,X-List-Hash');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
app.use('/node', nodeController);
app.use('/network', networkController);

registryHealthCheckCron.start();