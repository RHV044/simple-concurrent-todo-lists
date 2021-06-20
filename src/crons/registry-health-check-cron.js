const { default: axios } = require('axios');
const NodesService = require('../services/nodes-service');
const nodesService = new NodesService();
const Utils = require('../utils');
const cron = require('node-cron');

const CRON_MINUTE_SCHEDULE = 5

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
        this.cron = cron.schedule(`* */${CRON_MINUTE_SCHEDULE} * * * *`, () => this.doHealthCheck());
    }

    stop() {
        if (this.cron) this.cron.stop();
    }

    doHealthCheck() {
        console.log(`Performing healthcheck at ${new Date()}...`)
        nodesService.get().forEach(port => {
            axios
                .get(Utils.getNodeUrlForPort(port))
                .then(
                    () => console.log(`The port ${port} is up`),
                    () => {
                        console.log(`The port ${port} is down`);
                        nodesService.delete(port);
                    }
                )

        });
    }
}

module.exports = RegistryHealthCheckCron