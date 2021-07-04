const express = require('express');
const axios = require('axios');

const app = new express();

const Utils = require('./src/utils');
const Config = require('./src/config');
const healthCheckController = require('./src/controllers/health-check-controller');
const todoListsController = require('./src/controllers/todo-lists-controller');
const nodeController = require('./src/controllers/nodes-controller');

const ClusterPortsRepository = require('./src/repositories/cluster-ports-repository');

const port = process.argv[2];
if (!port) {
    console.error("ERROR: Please specify the port!");
    return;
}

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
app.use('/health-check', healthCheckController);
app.use('/lists', todoListsController);
app.use('/node', nodeController);

const server = app.listen(port, () => {
    Utils.log(`Listening on port ${port}`)
    Config.setSelfPort(port)
    axios
        .post(`${Utils.getUrlForPort(Config.getRegistryPort())}/node`, { port: port })
        .then(
            (response) => {
                ClusterPortsRepository.getInstance().addAll(response.data.ports);
                Utils.log(`Success initialization on registry. Available nodes are: ${ClusterPortsRepository.getInstance().list()}`);
            },
            (error) => {
                if (error.data) Utils.log(error.data);
                server.close(() => Utils.log("Closed server since we cannot connect to the registry"));
            }
        );
});

// Gracefull stop by listening to Signal Interruption (ctrl+c)
process.on('SIGINT', shutdown());
process.on('SIGTERM', shutdown());

function shutdown(){
    Utils.log("Gracefully shutting down node...");
    axios
    .delete(`${Utils.getUrlForPort(Config.getRegistryPort())}/node/${Config.selfPort}`)
    .then(
        (response) => {
            if(response.data.status === "ok") Utils.log("Self removed from registry successfully");
            else Utils.log(JSON.stringify(response.data));
            Utils.log("Goodbye!");
            process.exit();
        },
        (error) => {
            if (error.data) Utils.log(error.data);
            Utils.log("Unable to update registry, shutting down anyway =(");
            process.exit();
        }
    );
}
