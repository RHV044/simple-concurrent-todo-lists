const express = require('express');
const app = new express();
let healthCheckController = require('./src/controllers/health-check-controller')
let listsController = require('./src/controllers/lists-controller')

app.use(express.json());
app.use('/health-check', healthCheckController)
app.use('/lists', listsController)

app.listen(9001, () => {
    console.log("Listening on port 9001")
})