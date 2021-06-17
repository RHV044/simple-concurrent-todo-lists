const express = require('express');
const app = new express();
const nodeController = require('./src/controllers/nodes-controller');
const config = require('./src/config');

config.setIsRegistry(true);

app.listen(9000, () => {
    console.log("Listening on port 9000");
});

app.use(express.json());
app.use('/node', nodeController);