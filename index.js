const express = require('express');
const app = new express();
const bodyParser = require("body-parser");
let healthCheckRouter = require('./src/controllers/health-check-controller')
let listsController = require('./src/controllers/lists-controller')

app.listen(9001, () => {
    console.log("Listening on port 9001")
})

app.use('/health-check', healthCheckRouter)
app.use('/lists', listsController)
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());