class Config {

    constructor() {
        this.isRegistry = false;
    }

    static getRegistryPort() {
        return 9000;
    }

    static setIsRegistry(isRegistry) {
        this.isRegistry = isRegistry;
    }

    static setSelfPort(port) {
        this.selfPort = port;
    }

    static setHasInternet(hasInternet) {
        this.hasInternet = hasInternet;
    }

}

module.exports = Config