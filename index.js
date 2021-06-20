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
app.use('/health-check', healthCheckController);
app.use('/lists', todoListsController);
app.use('/node', nodeController);

const server = app.listen(port, () => {
    console.log(`Listening on port ${port}`)
    axios
        .post(Utils.getNodeUrlForPort(Config.getRegistryPort()), { port: port })
        .then(
            (response) => {
                ClusterPortsRepository.getInstance().addAll(response.data.ports);
                console.log(`Success initialization on registry. Available nodes are: ${ClusterPortsRepository.getInstance().list()}`);
            },
            (error) => {
                if (error.data) console.log(error.data);
                server.close(() => console.log("Closed server since we cannot connect to the registry"));
            }
        );
});

// TODO: add gracefull close