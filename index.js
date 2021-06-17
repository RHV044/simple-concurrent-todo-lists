const express = require('express');
const axios = require('axios');

const app = new express();

const Utils = require('./src/utils')
const healthCheckController = require('./src/controllers/health-check-controller')
const listsController = require('./src/controllers/lists-controller');
const nodeController = require('./src/controllers/nodes-controller');

const ClusterPortsRepository = require('./src/repositories/cluster-ports-repository');

const REGISTRY_PORT = 9000
const port = process.argv[2];

app.use(express.json());
app.use('/health-check', healthCheckController);
app.use('/lists', listsController);
app.use('/node', nodeController);

const server = app.listen(port, () => {
    console.log(`Listening on port ${port}`)
    console.log(`Try to: ${Utils.getUrlForPort(REGISTRY_PORT)}`)
    axios
        .post(Utils.getUrlForPort(REGISTRY_PORT), { port: port })
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

process.on('SIGTERM', () => {
    console.info('SIGTERM signal received.');
    axios.delete(Utils.getUrlForPort(REGISTRY_PORT), { port: port });
    server.close(() => console.log("Closed server"));
});