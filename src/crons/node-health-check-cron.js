const { default: axios } = require('axios');
const NodesService = require('../services/nodes-service');
const nodesService = new NodesService();
const Utils = require('../utils');
const Config = require('../config');
const cron = require('node-cron');
const NodeInitializerService = require('../services/node-initializer-service');

class NodeHealthCheckCron {

    start() {
        this.stop()
        /**
         * Cron schedule:
         * 
         *  ┌────────────── second (optional) (0-59)
         *  │ ┌──────────── minute (0-59)
         *  │ │ ┌────────── hour (0-23)
         *  │ │ │ ┌──────── day of month (1-31)
         *  │ │ │ │ ┌────── month (1-12 (or names))
         *  │ │ │ │ │ ┌──── day of week (0-7 (or names, 0 or 7 are Sunday))
         *  │ │ │ │ │ │
         *  │ │ │ │ │ │
         *  * * * * * *
         */
        this.hadInternet = true
        this.cron = cron.schedule(`*/10 * * * * *`, () => this.doHealthCheck())
    }

    stop() {
        if (this.cron) this.cron.stop();
    }

    doHealthCheck() {
        this.checkInternet((hasInternet) => {
            Utils.log(`Checking internet... It's ${hasInternet ? "on" : "off"} and it was ${this.hadInternet ? "on" : "off"}`)
            if (hasInternet && !this.hadInternet) {
                NodeInitializerService.init()
            }
            this.hadInternet = hasInternet
        })
    }

    checkInternet(onResponse) {
        if (!Config.hasInternet) {
            onResponse(false)
        } else {
            require('dns').lookup('google.com', (error) => {
                if (error && error.code == "ENOTFOUND") {
                    onResponse(false);
                } else {
                    onResponse(true);
                }
            })
        }
    }
}

module.exports = NodeHealthCheckCron