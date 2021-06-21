const { default: axios } = require('axios');
const NodesService = require('../services/nodes-service');
const nodesService = new NodesService();
const Utils = require('../utils');
const cron = require('node-cron');

const TOTAL_RETRIES = 3;

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
        this.cron = cron.schedule(`0 */10 * * * *`, () => this.doHealthCheck());
    }

    stop() {
        if (this.cron) this.cron.stop();
    }

    doHealthCheck() {
        Utils.log(`Performing health-check`);
        nodesService.get().forEach(port => this.doHealthCheckOnNode(port));
    }

    doHealthCheckOnNode(port, pendingRetries = TOTAL_RETRIES) {
        axios
            .get(`${Utils.getUrlForPort(port)}/health-check`)
            .then(
                () => Utils.log(`The port ${port} is up`),
                () => {
                    if (pendingRetries > 0) {
                        Utils.log(`The port ${port} is down, retrying...`);
                        setTimeout(() => this.doHealthCheckOnNode(port, pendingRetries - 1), 60000 * (TOTAL_RETRIES - pendingRetries + 1));
                    } else {
                        Utils.log(`The port ${port} is down`);
                        nodesService.delete(port);
                    }
                }
            );
    }
}

module.exports = RegistryHealthCheckCron