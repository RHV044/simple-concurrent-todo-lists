const { default: axios } = require('axios');
const NodesService = require('../services/nodes-service');
const nodesService = new NodesService();
const Utils = require('../utils');
const cron = require('node-cron');

class RegistryHealthCheckCron {

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
        this.cron = cron.schedule(`* */5 * * * *`, () => this.doHealthCheck());
    }

    stop() {
        if (this.cron) this.cron.stop();
    }

    doHealthCheck() {
        console.log(`Performing health-check at ${new Date()}...`);
        nodesService.get().forEach(port => this.doHealthCheckOnNode(port));
    }

    doHealthCheckOnNode(port, pendingRetries = 3) {
        axios
            .get(`${Utils.getUrlForPort(port)}/health-check`)
            .then(
                () => console.log(`The port ${port} is up`),
                () => {
                    if (pendingRetries > 0) {
                        console.log(`The port ${port} is down, retrying...`);
                        setTimeout(() => this.doHealthCheckOnNode(port, pendingRetries - 1), 2000);
                    } else {
                        console.log(`The port ${port} is down`);
                        nodesService.delete(port);
                    }
                }
            );
    }
}

module.exports = RegistryHealthCheckCron