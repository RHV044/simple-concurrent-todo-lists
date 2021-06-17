const express = require('express');
const app = new express();
const bodyParser = require("body-parser");
let nodeController = require('./controllers/nodes-controller');

app.listen(9000, () => {
    console.log("Listening on port 9000");
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/node', nodeController);